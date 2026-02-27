import pytest
from unittest.mock import MagicMock, patch
from backend.tasks import ingest_document_task

def test_ingest_document_task_success():
    # Mock ingest_file and os.path.exists
    with patch("backend.tasks.ingest_file") as mock_ingest, \
         patch("os.path.exists", return_value=True) as mock_exists, \
         patch("os.remove") as mock_remove:
        
        result = ingest_document_task("fake/path.txt", 1)
        
        mock_ingest.assert_called_once_with("fake/path.txt", user_id=1)
        mock_remove.assert_called_once_with("fake/path.txt")
        assert result["status"] == "success"

def test_ingest_document_task_cleanup_on_failure():
    # Ensure file is removed even if ingestion fails
    with patch("backend.tasks.ingest_file", side_effect=Exception("Ingest failed")), \
         patch("os.path.exists", return_value=True), \
         patch("os.remove") as mock_remove:
        
        with pytest.raises(Exception, match="Ingest failed"):
            ingest_document_task("fake/path.txt", 1)
            
        mock_remove.assert_called_once_with("fake/path.txt")
