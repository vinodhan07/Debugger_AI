from backend.agents.llm import llm
from backend.schemas import AgentState, Review

def reviewer(state: AgentState):
    structured_llm = llm.with_structured_output(Review)
    # Get the code from the debugger's output (which is a Debug object)
    debug_obj = state.get("debug")
    code_to_review = debug_obj.fixed_code if debug_obj else state["code"].code
    
    state["review"] = structured_llm.invoke(f"Review this code for quality and correctness:\\n{code_to_review}")
    return state
