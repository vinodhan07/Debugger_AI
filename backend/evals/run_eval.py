import json
import time
import requests
import numpy as np
from difflib import SequenceMatcher

# Configuration
BASE_URL = "http://localhost:8000"
EVAL_SET_PATH = "backend/evals/eval_set.json"
RESULTS_PATH = "backend/evals/eval_results.json"

def get_auth_token():
    # Login as User A (assumes user exists from previous phases)
    resp = requests.post(f"{BASE_URL}/auth/token", data={"username": "user_a@example.com", "password": "password123"})
    if resp.status_code != 200:
        # Try registering if login fails
        requests.post(f"{BASE_URL}/auth/register?email=user_a@example.com&password=password123")
        resp = requests.post(f"{BASE_URL}/auth/token", data={"username": "user_a@example.com", "password": "password123"})
    return resp.json()["access_token"]

def semantic_similarity(a, b):
    # Basic sequence matching for now (could be upgraded to LLM-as-a-judge or embeddings)
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def run_eval():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(EVAL_SET_PATH, "r") as f:
        eval_set = json.load(f)
    
    results = []
    
    print(f"🚀 Starting Evaluation on {len(eval_set)} questions...\n")
    
    for item in eval_set:
        print(f"Testing Question: {item['question']}")
        
        start_time = time.time()
        # Non-streaming for simpler eval processing
        # Note: Our /agent is streaming, so we need to collect chunks
        resp = requests.post(f"{BASE_URL}/agent", json={"question": item['question']}, headers=headers, stream=True)
        
        full_response = ""
        has_citations = False
        
        for chunk in resp.iter_lines():
            if chunk:
                decoded = chunk.decode('utf-8')
                if "SOURCES:" in decoded:
                    has_citations = True
                else:
                    full_response += decoded
        
        latency = time.time() - start_time
        similarity = semantic_similarity(full_response, item['expected_answer'])
        
        res = {
            "question": item['question'],
            "similarity_score": round(similarity, 3),
            "latency": round(latency, 2),
            "has_citations": has_citations,
            "status": "PASS" if similarity > 0.5 else "FAIL"
        }
        results.append(res)
        print(f"  Result: {res['status']} | Similarity: {res['similarity_score']} | Latency: {res['latency']}s\n")

    # Aggregate
    avg_sim = np.mean([r['similarity_score'] for r in results])
    avg_lat = np.mean([r['latency'] for r in results])
    pass_rate = len([r for r in results if r['status'] == "PASS"]) / len(results)
    
    summary = {
        "timestamp": time.time(),
        "average_similarity": round(avg_sim, 3),
        "average_latency": round(avg_lat, 2),
        "pass_rate": pass_rate,
        "detail": results
    }
    
    with open(RESULTS_PATH, "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Evaluation Complete. Results saved to {RESULTS_PATH}")
    print(f"📊 Summary: Pass Rate: {pass_rate*100}% | Avg Latency: {round(avg_lat, 2)}s")

if __name__ == "__main__":
    run_eval()
