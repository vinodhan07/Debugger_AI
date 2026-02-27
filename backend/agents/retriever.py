import hashlib
import json
import redis
import os
from sqlalchemy import or_
from backend.agents.embeddings import embeddings
from backend.database import SessionLocal
from backend.models import Document

# Initialize Redis
redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

def retriever_agent(state):
    query = state["question"]
    user_id = state.get("user_id")

    # 1. Check Redis Cache
    cache_key = f"retrieval:{user_id}:{hashlib.sha256(query.encode()).hexdigest()}"
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            cached = json.loads(cached_data)
            state["context"] = cached["context"]
            state["citations"] = cached["citations"]
            return state
    except Exception as e:
        print(f"Redis Cache Error: {e}")

    # 2. Generate embedding for the query
    query_vector = embeddings.embed_query(query)

    with SessionLocal() as db:
        # Scope: Public documents (user_id IS NULL) OR user's own documents
        user_scope = or_(Document.user_id == None, Document.user_id == user_id) if user_id else Document.user_id == None
        
        docs = db.query(Document).filter(user_scope, Document.is_deleted == False).order_by(
            Document.embedding.l2_distance(query_vector)
        ).limit(3).all()

        context = "\n\n".join([doc.content for doc in docs])
        citations = [{"source": doc.source, "page": doc.page} for doc in docs]
        
        state["context"] = context
        state["citations"] = citations

        # 3. Save to Redis (expire in 5 minutes)
        try:
            redis_client.setex(
                cache_key, 
                300, 
                json.dumps({"context": context, "citations": citations})
            )
        except Exception as e:
            print(f"Redis Save Error: {e}")

    return state
