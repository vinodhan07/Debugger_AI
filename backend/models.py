from sqlalchemy import Column, Integer, Text, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from backend.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Nullable for OAuth users
    role = Column(String, default="user", nullable=False)
    
    # OAuth Fields
    google_id = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    picture_url = Column(String, nullable=True)
    
    conversations = relationship("Conversation", back_populates="user")
    documents = relationship("Document", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")
    chats = relationship("Chat", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)  # user / assistant
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    feedbacks = relationship("Feedback", back_populates="message")

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(Text)
    plan = Column(Text)
    code = Column(Text)
    debug = Column(Text)

    conversation = relationship("Conversation", back_populates="chats")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for public docs
    content = Column(Text)
    metadata_ = Column("metadata", JSONB)
    embedding = Column(Vector(4096))  # 4096 for llama3
    source = Column(String)
    page = Column(Integer)
    
    # Stage 8 Governance Fields
    file_size = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=True)
    checksum = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, index=True)

    user = relationship("User", back_populates="documents")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1 for thumbs up, -1 for thumbs down
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")
