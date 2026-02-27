from backend.agents.llm import llm

def safety_agent(state):
    question = state["question"]
    
    prompt = (
        "Classify the following user input as 'safe' or 'unsafe'.\n"
        "Unsafe criteria: malware, hacking, violence, illegal acts, or harmful content.\n\n"
        f"Input: {question}\n\n"
        "Classification (safe/unsafe):"
    )
    
    response = llm.invoke(prompt)
    classification = response.content.strip().lower()
    
    state["is_safe"] = "safe" in classification
    if not state["is_safe"]:
        state["debug"] = "I cannot fulfill this request as it violates safety guidelines."
        
    return state
