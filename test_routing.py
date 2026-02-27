import requests

BASE_URL = "http://localhost:8000"

def test_routing():
    login_resp = requests.post(f"{BASE_URL}/auth/token", data={"username": "user_a@example.com", "password": "password123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("--- 1. Testing Code Intent (Binary Search) ---")
    resp_code = requests.post(f"{BASE_URL}/agent", json={"question": "Write a binary search in python."}, headers=headers, stream=True)
    for line in resp_code.iter_lines():
        if line: print(line.decode('utf-8'))

    print("\n--- 2. Testing QA Intent (Project Goals) ---")
    resp_qa = requests.post(f"{BASE_URL}/agent", json={"question": "What are the main goals of Project Phoenix?"}, headers=headers, stream=True)
    for line in resp_qa.iter_lines():
        if line: print(line.decode('utf-8'))

if __name__ == "__main__":
    test_routing()
