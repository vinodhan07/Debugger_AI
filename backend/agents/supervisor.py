from langgraph.graph import StateGraph
from .coder import code
from .debugger import debug
from .github import clone
from Backend.schemas import AgentState
from Backend.agents.llm import llm  

def router(state):
    msg = state["input"]

    if "github" in msg:
        return "github"
    if "error" in msg or "bug" in msg:
        return "debug"

    return "code"

def code_agent(state):
    return {"output": code(state["input"])}

def debug_agent(state):
    return {"output": debug(state["input"])}

def github_agent(state):
    return {"output": clone(state["input"].split()[-1])}

graph = StateGraph(dict)

graph.add_node("code", code_agent)
graph.add_node("debug", debug_agent)
graph.add_node("github", github_agent)

graph.set_conditional_entry_point(router)
graph.add_edge("code", "__end__")
graph.add_edge("debug", "__end__")
graph.add_edge("github", "__end__")

app = graph.compile()

def supervisor(message):
    return app.invoke({"input": message})["output"]
