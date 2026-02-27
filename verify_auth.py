import requests
import json

BASE_URL = "http://localhost:8000"

def test_conversations_and_history():
    print("--- 1. Logging in User A ---")
    login_resp = requests.post(f"{BASE_URL}/auth/token", data={"username": "user_a@example.com", "password": "password123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Token obtained.")

    print("\n--- 2. Starting New Conversation ---")
    # First question to establish context
    agent_resp = requests.post(f"{BASE_URL}/agent", json={"question": "What is Debuggers AI?"}, headers=headers, stream=True)
    conv_id = None
    for line in agent_resp.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            print(decoded)
            if "CONVERSATION_ID:" in decoded:
                conv_id = decoded.split(":")[1].strip()

    print(f"\n--- 3. Following Up (Conversation ID: {conv_id}) ---")
    # Follow-up question that requires history
    agent_resp_v2 = requests.post(f"{BASE_URL}/agent", json={"question": "Tell me more about its debugging capabilities.", "conversation_id": int(conv_id)}, headers=headers, stream=True)
    for line in agent_resp_v2.iter_lines():
        if line:
            print(line.decode('utf-8'))

    print("\n--- 4. Checking Conversation List ---")
    list_resp = requests.get(f"{BASE_URL}/conversations", headers=headers)
    print(list_resp.json())

    print("\n--- 5. Fetching Full History for Conversation ---")
    hist_resp = requests.get(f"{BASE_URL}/conversations/{conv_id}", headers=headers)
    print(json.dumps(hist_resp.json(), indent=2))

if __name__ == "__main__":
    test_conversations_and_history()
