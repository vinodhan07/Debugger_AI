from backend.database import SessionLocal
from backend.models import Chat, Message

def save_memory(state):
    with SessionLocal() as db:
        conversation_id = state.get("conversation_id")
        user_id = state.get("user_id")

        # 1. Save technical trace
        chat = Chat(
            question=state.get("question", ""),
            plan=state.get("plan"),
            code=state.get("code"),
            debug=state.get("debug"),
            user_id=user_id,
            conversation_id=conversation_id
        )
        db.add(chat)

        # 2. Save Conversation Messages for history recall
        # Save User Message
        user_msg = Message(
            conversation_id=conversation_id,
            role="user",
            content=state.get("question")
        )
        db.add(user_msg)

        # Save Assistant Message (Final debug response)
        asst_msg = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=state.get("debug")
        )
        db.add(asst_msg)

        db.commit()
    
    return state
