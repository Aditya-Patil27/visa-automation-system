import asyncio
from app.rag import handle_query, index_documents

async def test_rag():
    # 1. First, make sure we have some documents in FAISS index if not already
    print("Testing index_documents...")
    try:
        index_documents([
            "A UK Standard Visitor Visa is normally valid for 6 months. You cannot work on this visa.",
            "For a Schengen Visa to France, you must provide a travel itinerary and travel insurance covering 30k Euros."
        ])
        print("Successfully indexed test documents.")
    except Exception as e:
        print(f"Error indexing docs: {e}")

    # 2. Then, run a query
    print("\nTesting handle_query...")
    try:
        query = "What is the requirement for travel insurance to France?"
        print(f"Query: {query}")
        result = await handle_query(query)
        print(f"\nResponse:\n{result}")
    except Exception as e:
        print(f"Error querying: {e}")

if __name__ == "__main__":
    asyncio.run(test_rag())
