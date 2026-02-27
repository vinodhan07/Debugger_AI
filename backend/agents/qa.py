from backend.agents.llm import llm

def qa_agent(state):
    prompt = (
        "You are a helpful assistant. Answer the user's question based ONLY on the provided context.\n"
        "If the context doesn't contain the answer, say you don't know.\n\n"
        f"Context:\n{state.get('context', '')}\n\n"
        f"Question: {state['question']}"
    )
    
    response = llm.invoke(prompt)
    state["debug"] = response.content  # Stick to 'debug' for uniform saving in memory.py
    return state
