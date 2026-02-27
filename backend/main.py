from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.graph import graph
from backend.auth import (
    get_db, 
    get_current_user, 
    get_password_hash, 
    verify_password, 
    create_access_token,
    verify_google_token,
    get_or_create_google_user
)
from .tasks import ingest_document_task
from backend.models import User, Conversation as ChatSession, Message, Feedback, Document
from backend.dependencies import require_role
import os
import shutil
import uuid
import time
import json
from fastapi.responses import StreamingResponse, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

# Configure Logging (Set to INFO for performance)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP Requests", ["method", "endpoint", "status"])
AGENT_LATENCY = Histogram("agent_execution_latency_seconds", "Latency of agent execution")
TOKEN_COUNT = Counter("token_count_total", "Total tokens generated")

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/metrics")
def metrics(current_user: User = Depends(require_role("admin"))):
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/auth/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = User(email=email, hashed_password=get_password_hash(password))
    db.add(user)
    db.commit()
    return {"status": "user created"}

@app.post("/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        throw_auth_error("Incorrect email or password")
    
    # Include role and user_id in the token payload
    access_token = create_access_token(data={
        "sub": user.email,
        "user_id": user.id,
        "role": user.role
    })
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/google")
async def google_login(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("id_token")
    if not token:
        throw_auth_error("Missing id_token")
    
    idinfo = verify_google_token(token)
    if not idinfo:
        throw_auth_error("Invalid Google Token")
    
    user = get_or_create_google_user(db, idinfo)
    
    access_token = create_access_token(data={
        "sub": user.email,
        "user_id": user.id,
        "role": user.role
    })
    return {"access_token": access_token, "token_type": "bearer"}

def throw_auth_error(detail: str):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )

import hashlib

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Role-Based Upload Control
    if current_user.role == "viewer":
        raise HTTPException(status_code=403, detail="Viewers are not allowed to upload documents.")
    # Read file to calculate checksum
    content = await file.read()
    checksum = hashlib.sha256(content).hexdigest()
    await file.seek(0) # Reset file pointer for saving
    
    # Check for duplicates (same user, same checksum, not deleted)
    from backend.models import Document
    existing = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.checksum == checksum,
        Document.is_deleted == False
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="This file has already been uploaded.")

    # Create temp file
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{current_user.id}_{uuid.uuid4()}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # Offload to Celery with checksum
    ingest_document_task.delay(file_path, current_user.id, checksum=checksum)
    
    return {"status": "upload successful", "message": "Processing offloaded to Celery worker", "filename": file.filename}

from fastapi.responses import StreamingResponse
import json

@app.get("/conversations")
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    return [{"id": c.id, "title": c.title or f"Chat {c.id}", "created_at": c.created_at} for c in convs]

@app.get("/conversations/{conversation_id}")
def get_conversation_history(conversation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(ChatSession).filter(ChatSession.id == conversation_id, ChatSession.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # We could return messages here if needed for the UI
    msgs = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    return {
        "id": conv.id,
        "title": conv.title,
        "messages": [{"role": m.role, "content": m.content} for m in msgs]
    }

    return {"id": new_conv.id}

@app.patch("/conversations/{conversation_id}")
def update_conversation(
    conversation_id: int, 
    payload: dict,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    conv = db.query(ChatSession).filter(ChatSession.id == conversation_id, ChatSession.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if "title" in payload:
        conv.title = payload["title"]
    
    db.commit()
    return {"status": "updated", "title": conv.title}

@app.post("/agent")
@limiter.limit("5/minute")
async def run_agent(
    request: Request,
    payload: dict, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    REQUEST_COUNT.labels(method="POST", endpoint="/agent", status="200").inc()
    start_time = time.time()
    
    # Determine conversation
    conversation_id = payload.get("conversation_id")
    if not conversation_id:
        # Create new conversation if none provided
        new_conv = ChatSession(user_id=current_user.id, title=payload["question"][:30] + "...")
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
        conversation_id = new_conv.id
    
    state = {
        "question": payload["question"],
        "user_id": current_user.id,
        "conversation_id": conversation_id
    }
    
    def stream_tokens():
        try:
            for event in graph.stream(state, stream_mode="updates"):
                for node, content in event.items():
                    if node == "debugger" and "debug" in content:
                        yield content["debug"]
                    elif node == "memory":
                        if "citations" in state:
                            yield "\n\nSOURCES:\n"
                            yield json.dumps(state["citations"], indent=2)
                        yield f"\n\nCONVERSATION_ID: {conversation_id}"
        finally:
            latency = time.time() - start_time
            AGENT_LATENCY.observe(latency)
            logger.info(f"Agent Execution Latency: {latency:.4f}s")
                    
    return StreamingResponse(stream_tokens(), media_type="text/plain")

from .schemas import FeedbackRequest

@app.post("/feedback")
async def add_feedback(
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify message exists
    msg = db.query(Message).filter(Message.id == request.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    feedback = Feedback(
        message_id=request.message_id,
        user_id=current_user.id,
        rating=request.rating,
        comment=request.comment
    )
    db.add(feedback)
    db.commit()
    return {"status": "feedback received"}

@app.get("/documents")
def get_user_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from backend.models import Document
    docs = db.query(Document).filter(Document.user_id == current_user.id, Document.is_deleted == False).order_by(Document.created_at.desc()).all()
    
    seen = {}
    for d in docs:
        src = d.source or "unknown"
        if src not in seen:
            seen[src] = {
                "id": d.id, 
                "filename": src, 
                "size": d.file_size, 
                "chunks": 1, 
                "date": d.created_at.strftime("%Y-%m-%d %H:%M")
            }
        else:
            seen[src]["chunks"] += 1
            
    return list(seen.values())

@app.delete("/documents/{id}")
def delete_document(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from backend.models import Document
    target = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.query(Document).filter(Document.source == target.source, Document.user_id == current_user.id).update({"is_deleted": True})
    db.commit()
    return {"status": "success", "message": f"Deleted {target.source}"}

@app.get("/documents/{id}/chunks")
def get_document_chunks(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from backend.models import Document
    target = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Document not found")
    
    chunks = db.query(Document).filter(Document.source == target.source, Document.user_id == current_user.id, Document.is_deleted == False).order_by(Document.chunk_index).all()
    return {
        "filename": target.source,
        "chunks": [{"index": c.chunk_index, "content": c.content} for c in chunks]
    }

@app.post("/documents/{id}/reembed")
def reembed_document(id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    target = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"status": "success", "message": f"Re-embedding triggered for {target.source}"}

@app.get("/admin/stats")
def admin_stats(current_user = Depends(require_role("admin")), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_docs = db.query(Document).filter(Document.is_deleted == False).count()
    total_conversations = db.query(ChatSession).count()

    return {
        "users": total_users,
        "documents": total_docs,
        "conversations": total_conversations
    }
