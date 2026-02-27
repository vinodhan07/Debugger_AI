import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth import get_current_user, get_db
from backend.models import User, Message, Feedback
from unittest.mock import MagicMock

# Mock dependencies
mock_db = MagicMock()
mock_user = User(id=1, email="test@example.com")

def override_get_db():
    yield mock_db

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_add_feedback_success():
    # Mock message exists
    mock_msg = Message(id=10, conversation_id=1)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_msg
    
    response = client.post(
        "/feedback",
        json={"message_id": 10, "rating": 1, "comment": "Great!"}
    )
    
    assert response.status_code == 200
    assert response.json()["status"] == "feedback received"
    mock_db.add.assert_called()
    mock_db.commit.assert_called()

def test_add_feedback_message_not_found():
    # Mock message not found
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    response = client.post(
        "/feedback",
        json={"message_id": 999, "rating": 1}
    )
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Message not found"
