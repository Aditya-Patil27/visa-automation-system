from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    groq_api_key: str
    faiss_index_path: str = "faiss_index"
    mongodb_url: str = ""

    class Config:
        env_file = "../backend/.env"
        extra = "ignore"


def load_vectorstore():
    settings = Settings()
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    if os.path.exists(settings.faiss_index_path):
        return FAISS.load_local(settings.faiss_index_path, embeddings, allow_dangerous_deserialization=True)
    else:
        # create an empty store
        return FAISS.from_texts([""], embeddings)


def index_documents(docs: List[str]):
    vs = load_vectorstore()
    vs.add_texts(docs)
    vs.save_local(Settings().faiss_index_path)


def query(question: str):
    vs = load_vectorstore()
    return vs.similarity_search(question, k=3)
