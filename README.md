# AI-Powered Visa Automation and Embassy Requirement Tracker System

## Overview
This repository contains a minimal viable product (MVP) implementation of an AI-powered visa assistance system. Employees can log in, ask visa-related questions via a chatbot, and administrators can manage visa requirements.

### Tech Stack
- **Frontend**: React.js
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Layer**: LangChain + OpenAI API
- **Vector Database**: FAISS

## Folder Structure
```
visa-automation-system/
├── admin_dashboard
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── rag.py
│   │   ├── routes.py
│   │   └── security.py
│   └── requirements.txt
├── database
├── frontend
│   ├── package.json
│   └── src
│       ├── App.js
│       ├── index.js
│       └── components
│           ├── Chatbot.js
│           └── AdminDashboard.js
├── rag_pipeline
│   ├── index_docs.py
│   └── pipeline.py
└── README.md
```

## Getting Started
### Backend
1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Ensure MongoDB is running locally (or update `mongodb_url` in `database.py`).
   > **Note:** the server will fail if it cannot connect; start `mongod` or use a hosted URI.
3. Populate `.env` with your OpenAI API key.
4. Run the FastAPI server.

   You can either start from the project root:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
   or, if you `cd` into the `backend` directory, adjust the import path or app directory:
   ```bash
   # from within backend/
   uvicorn app.main:app --reload --port 8000 --app-dir .
   ```

   The first form requires that the current working directory include the `backend` package (i.e. run from the repository root),
   otherwise Python will fail to locate the `backend` module.

   **CORS note:** the app is configured to allow requests from `http://localhost:3000`,
   which is where the React frontend runs by default. Adjust the `allow_origins` list in
   `backend/app/main.py` if you host the frontend elsewhere.

### Frontend
1. Navigate to `frontend` and install packages:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. A browser window will open at `http://localhost:3000`.

## Usage
- Register an employee or admin via `POST /register`.
- Login via the frontend or API to receive a JWT.
- Employees can ask questions in the chatbot; responses are generated using a basic RAG pipeline.
- Admins can add/edit/delete visa requirement entries and view them in the dashboard.

## Extensibility
The code is structured to allow easy expansion:
- Add LangGraph workflows in `rag_pipeline`.
- Implement eligibility checking, scraping embassy websites, or richer conversation logic.

## Example Code Snippets

### FastAPI Endpoint (login)
```python
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user["email"], "role": user.get("role")})
    return {"access_token": token}
```

### MongoDB Schema (Pydantic Models)
```python
class VisaRequirement(BaseModel):
    country: str
    visa_type: str
    documents: List[str]
    processing_time: Optional[str] = None
```

### FAISS Embedding Search
```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

emb = OpenAIEmbeddings(openai_api_key=OPENAI_KEY)
vs = FAISS.load_local("faiss_index", emb)
results = vs.similarity_search("What documents are needed for a US tourist visa?", k=3)
```

### Simple RAG Pipeline (backend/rag.py)
```python
async def handle_query(question: str) -> str:
    vs = load_vectorstore()
    docs = vs.similarity_search(question, k=3)
    context_text = "\n".join([doc.page_content for doc in docs])
    llm = OpenAI(openai_api_key=Settings().openai_api_key, temperature=0.2)
    prompt = f"Context:\n{context_text}\n\nQuestion: {question}\nAnswer:"
    response = llm(prompt)
    return response
```

### React Chatbot Component
```jsx
function Chatbot({ token }) {
  // ...
  const sendQuestion = async () => {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
    });
    // ...
  };
}
```


---
Happy coding! 🚀
