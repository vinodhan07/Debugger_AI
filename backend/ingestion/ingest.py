import os

def ingest_file(path: str, user_id: int = None, checksum: str = None):
    """Full pipeline: Load -> Chunk -> Embed -> Store (ORM based)."""
    docs = load_file(path)
    chunks = chunk_docs(docs)
    
    file_size = os.path.getsize(path) if os.path.exists(path) else 0

    with SessionLocal() as db:
        for idx, chunk in enumerate(chunks):
            # Generate embedding using the centralized client
            vector = embeddings.embed_query(chunk.page_content)

            doc = Document(
                content=chunk.page_content,
                metadata_=chunk.metadata,
                embedding=vector,
                source=chunk.metadata.get("source"),
                page=chunk.metadata.get("page", 0),
                user_id=user_id,
                # Stage 8 metadata
                chunk_index=idx,
                file_size=file_size,
                checksum=checksum,
                is_deleted=False
            )
            db.add(doc)
        
        db.commit()
