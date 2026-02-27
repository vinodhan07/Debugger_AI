from langgraph.graph import StateGraph, END

from backend.agents.safety import safety_agent
from backend.agents.history_loader import history_loader
from backend.agents.retriever import retriever_agent
from backend.agents.router import router_agent
from backend.agents.qa import qa_agent
from backend.agents.planner import planner_agent
from backend.agents.coder import coder_agent
from backend.agents.debugger import debug_agent
from backend.agents.memory import save_memory

builder = StateGraph(dict)

builder.add_node("safety", safety_agent)
builder.add_node("history", history_loader)
builder.add_node("retriever", retriever_agent)
builder.add_node("router", router_agent)
builder.add_node("qa", qa_agent)
builder.add_node("planner", planner_agent)
builder.add_node("coder", coder_agent)
builder.add_node("debugger", debug_agent)
builder.add_node("memory", save_memory)

builder.set_entry_point("safety")

def route_safety(state):
    if state.get("is_safe"):
        return "history"
    return "memory"

builder.add_conditional_edges(
    "safety",
    route_safety,
    {
        "history": "history",
        "memory": "memory"
    }
)

builder.add_edge("history", "retriever")
builder.add_edge("retriever", "router")

def route_intent(state):
    if state.get("intent") == "code":
        return "planner"
    return "qa"

builder.add_conditional_edges(
    "router",
    route_intent,
    {
        "planner": "planner",
        "qa": "qa"
    }
)

builder.add_edge("qa", "memory")
builder.add_edge("planner", "coder")
builder.add_edge("coder", "debugger")
builder.add_edge("debugger", "memory")
builder.add_edge("memory", END)

graph = builder.compile()
