from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3:8b-instruct-q4_0",
    base_url="http://ollama:11434",
    streaming=True
)
