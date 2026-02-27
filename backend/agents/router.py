from backend.agents.llm import llm

def router_agent(state):
    question = state["question"]
    
    prompt = (
        "Classify the following user intent into one of two categories: 'code' or 'qa'.\n"
        "Criteria for 'code': The user wants code written, debugged, explained technically, or modified.\n"
        "Criteria for 'qa': The user is asking a general question, looking for an explanation from documents, or just chatting.\n\n"
        f"Input: {question}\n\n"
        "Classification (code/qa):"
    )
    
    response = llm.invoke(prompt)
    classification = response.content.strip().lower()
    
    state["intent"] = "code" if "code" in classification else "qa"
    return state
