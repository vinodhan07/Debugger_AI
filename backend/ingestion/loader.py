from langchain_community.document_loaders import PyPDFLoader, TextLoader, CSVLoader

def load_file(path: str):
    """Loads PDF, TXT, MD, CSV, or DOCX files into LangChain documents."""
    lower = path.lower()

    if lower.endswith(".pdf"):
        return PyPDFLoader(path).load()
    elif lower.endswith(".csv"):
        return CSVLoader(path).load()
    elif lower.endswith(".docx"):
        try:
            from langchain_community.document_loaders import UnstructuredWordDocumentLoader
            return UnstructuredWordDocumentLoader(path).load()
        except ImportError:
            # Fallback: read as raw text
            return TextLoader(path).load()
    else:
        # TXT, MD, and any other text-based format
        return TextLoader(path).load()
