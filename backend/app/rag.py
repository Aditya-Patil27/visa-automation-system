import os
from typing import List

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    faiss_index_path: str = "faiss_index"
    mongodb_url: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


def load_vectorstore():
    settings = Settings()
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    if os.path.exists(settings.faiss_index_path):
        return FAISS.load_local(settings.faiss_index_path, embeddings, allow_dangerous_deserialization=True)
    else:
        # create empty vectorstore
        return FAISS.from_texts([""], embeddings)


async def handle_query(question: str) -> str:
    # convert to embedding, search, and call OpenAI with context
    vs = load_vectorstore()
    docs = vs.similarity_search(question, k=3)
    context_text = "\n".join([doc.page_content for doc in docs])
    llm = ChatGroq(groq_api_key=Settings().groq_api_key, model_name="llama-3.1-8b-instant", temperature=0.2)
    prompt = f"Context:\n{context_text}\n\nQuestion: {question}\nAnswer:"  
    response = llm.invoke(prompt)
    return response.content



def index_documents(docs: List[str]):
    """Example function to build FAISS index from visa docs."""
    vs = load_vectorstore()
    vs.add_texts(docs)
    vs.save_local(Settings().faiss_index_path)


async def index_from_db():
    """Load all visa descriptions from Mongo and index them."""
    from .database import get_database

    db = get_database()
    docs = []
    # motor requires async iteration
    cursor = db.visas.find()
    async for doc in cursor:
        desc = f"Country: {doc.get('country')}\nType: {doc.get('visa_type')}\nDocs: {', '.join(doc.get('documents', []))}\nTime: {doc.get('processing_time', '')}"
        docs.append(desc)
    if docs:
        index_documents(docs)
