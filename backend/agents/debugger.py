import sys
from langchain_core.messages import SystemMessage, HumanMessage
from backend.agents.llm import llm

def debug_agent(state):
    system_prompt = (
        "You are a senior QA engineer. "
        "Analyze the provided code for syntax errors, logical flaws, and potential runtime issues. "
        "Provide a concise summary of your findings. If the code is correct, confirm it."
    )
    
    code = state.get("code", "No code provided.")
    user_message = f"Here is the code to review:\n{code}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    full_response = ""
    try:
        for chunk in llm.stream(messages):
            token = chunk.content
            if token:
                full_response += token
                # Yield partial update for graph.stream
                yield {"debug": token}
    except Exception as e:
        pass
    
    # Ensure final state is updated
    return {"debug": full_response}
