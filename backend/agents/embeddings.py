from langchain_ollama import OllamaEmbeddings

# Use the same base_url as the LLM for consistency within docker network
embeddings = OllamaEmbeddings(
    model="llama3:8b-instruct-q4_0",
    base_url="http://ollama:11434"
)
