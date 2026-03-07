from fastapi import FastAPI
from .routes import router

app = FastAPI(title="Visa Automation API")

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    # index visa docs into FAISS at startup (non-blocking)
    try:
        from .rag import index_from_db

        await index_from_db()
    except Exception as e:
        print("Failed to index docs on startup", e)


@app.get("/")
def root():
    return {"message": "Welcome to Visa Automation API"}
