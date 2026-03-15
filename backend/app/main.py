from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .database import init_db

app = FastAPI(title="Visa Automation API")

# allow frontend access from localhost:3000 during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def startup_event():
    # create all SQL tables
    await init_db()

    # index visa docs into FAISS at startup (non-blocking)
    try:
        from .rag import index_from_db

        await index_from_db()
    except Exception as e:
        print("Failed to index docs on startup", e)


@app.get("/")
def root():
    return {"message": "Welcome to Visa Automation API"}
