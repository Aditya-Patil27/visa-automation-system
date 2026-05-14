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
    vs = load_vectorstore()
    docs = vs.similarity_search(question, k=3)
    
    if not docs or not docs[0].page_content.strip():
        return "I don't have information about that visa requirement. Please try asking about a specific country or visa type, or contact an administrator to add this information to the knowledge base."
    
    context_text = "\n".join([doc.page_content for doc in docs])
    
    prompt = f"""You are a helpful visa assistant specializing in embassy requirements and visa application processes.

Use the following context from the visa knowledge base to answer the user's question. Always cite specific information when available.

Context:
{context_text}

Question: {question}

Answer:"""
    
    llm = ChatGroq(groq_api_key=Settings().groq_api_key, model_name="llama-3.1-8b-instant", temperature=0.2)
    response = llm.invoke(prompt)
    
    if docs and docs[0].metadata:
        source_info = docs[0].metadata.get('source', '')
        if source_info:
            response.content += f"\n\n*Source: {source_info}*"
    
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
    cursor = db.visas.find()
    async for doc in cursor:
        country = doc.get('country', '')
        visa_type = doc.get('visa_type', '')
        desc = f"Country: {country}\nType: {visa_type}\nDocs: {', '.join(doc.get('documents', []))}\nTime: {doc.get('processing_time', '')}"
        docs.append((desc, {"country": country, "visa_type": visa_type, "source": f"{country} {visa_type}"}))
    if docs:
        texts = [d[0] for d in docs]
        metadatas = [d[1] for d in docs]
        vs = load_vectorstore()
        vs.add_texts(texts, metadatas=metadatas)
        vs.save_local(Settings().faiss_index_path)
