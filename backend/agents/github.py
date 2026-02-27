import subprocess, os
from Backend.schemas import AgentState
from Backend.agents.llm import llm

def clone(repo):
    subprocess.run(["git","clone",repo])
    folder = repo.split("/")[-1].replace(".git","")

    code = ""
    for root,_,files in os.walk(folder):
        for f in files:
            if f.endswith(".py"):
                with open(os.path.join(root,f)) as file:
                    code += file.read()

    return "Repository analyzed:\n"+code[:6000]
