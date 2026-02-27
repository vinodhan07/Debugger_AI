from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Message

def history_loader(state):
    conversation_id = state.get("conversation_id")
    if not conversation_id:
        state["history"] = []
        return state

    with SessionLocal() as db:
        # Fetch last 6 messages for context (context reduction)
        msgs = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.desc()).limit(6).all()
        
        # Reverse to get chronological order
        msgs.reverse()
        
        history = [
            {"role": m.role, "content": m.content} 
            for m in msgs
        ]
        
        state["history"] = history

    return state
