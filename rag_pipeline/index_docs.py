"""
Simple script to index visa documents into FAISS. Run after populating MongoDB or manual list.
"""
from .pipeline import index_documents

if __name__ == "__main__":
    # Example docs list: in real life pull from MongoDB
    docs = [
        "For a US tourist visa you need a passport, photo, and application fee.",
        "Canadian work visa requires an employer letter and proof of funds.",
    ]
    index_documents(docs)
    print("Indexed sample documents")
