from backend.agents.llm import llm
from langchain_core.messages import SystemMessage, HumanMessage

def planner_agent(state):
    history = state.get("history", [])
    history_str = "\n".join([f"{m['role']}: {m['content']}" for m in history])
    
    system_prompt = (
        "You are a master technical architect. "
        "Based on the provided context, conversation history, and user question, "
        "create a detailed step-by-step implementation plan. "
        "Focus on technical accuracy and best practices."
    )
    
    user_message = (
        f"Context:\n{state['context']}\n\n"
        f"Conversation History:\n{history_str}\n\n"
        f"Current Question: {state['question']}\n\n"
        "Create a plan."
    )
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    response = llm.invoke(messages)
    state["plan"] = response.content
    return state
