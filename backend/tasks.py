from .celery_app import celery_app
from .ingestion.ingest import ingest_file
import os

@celery_app.task(name="tasks.ingest_document")
def ingest_document_task(file_path: str, user_id: int, checksum: str = None):
    """
    Background task to ingest a document and clean up the temp file.
    """
    try:
        # Perform the actual ingestion
        ingest_file(file_path, user_id=user_id, checksum=checksum)
    finally:
        # Always clean up the temp file
        if os.path.exists(file_path):
            os.remove(file_path)
    return {"status": "success", "file": file_path}
