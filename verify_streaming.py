import requests
import json

def test_streaming():
    url = "http://localhost:8000/agent"
    payload = {"question": "What is Debuggers AI?"}
    
    print(f"Testing streaming from {url}...")
    
    with requests.post(url, json=payload, stream=True) as r:
        r.raise_for_status()
        print("\n--- STREAMING RESPONSE ---")
        for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                print(chunk, end="", flush=True)
        print("\n\n--- STREAM COMPLETED ---")

if __name__ == "__main__":
    test_streaming()
