from langchain_core.messages import SystemMessage, HumanMessage
from backend.agents.llm import llm

def coder_agent(state):
    system_prompt = (
        "You are an expert Python developer. "
        "Write clean, efficient, and error-free code based on the provided plan. "
        "Output ONLY the python code within markdown code blocks."
    )
    
    user_message = f"Here is the plan:\n{state['plan']}\n\nWrite the code."
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    response = llm.invoke(messages)
    state["code"] = response.content
    return state
