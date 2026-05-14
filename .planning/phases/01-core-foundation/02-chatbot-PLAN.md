---
plan: 02-chatbot
phase: 01
objective: Employee chatbot with RAG (Retrieval Augmented Generation) integration
wave: 1
depends_on: null
requirements_addressed: [REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, NFR-02, NFR-09, NFR-10]
files_modified:
  - backend/app/rag.py
  - backend/app/routes.py
  - frontend/src/components/Chatbot.js
  - frontend/src/components/AiVisaChatbot.js
autonomous: false
---

# Plan 02-chatbot: Employee Chatbot with RAG

## Context

Phase 01 builds core functionality. This plan covers the chatbot that employees use to query visa requirements. The RAG pipeline combines FAISS vector search with OpenAI LLM responses.

## Tasks

### Task 2.1: Review existing RAG implementation

<read_first>
- backend/app/rag.py
- backend/app/routes.py
</read_first>

<action>
1. Review existing rag.py - understand FAISS loading, similarity search, and LLM prompt construction
2. Verify the handle_query() function exists and handles async properly
3. Check if FAISS index exists in backend/faiss_index/
4. Review POST /chat endpoint in routes.py
</action>

<acceptance_criteria>
- backend/app/rag.py contains `load_vectorstore()` function
- backend/app/rag.py contains `handle_query()` async function
- backend/app/rag.py uses OpenAI with temperature=0.2
- POST /chat endpoint exists in routes.py
</acceptance_criteria>

### Task 2.2: Enhance RAG pipeline with context

<read_first>
- backend/app/rag.py
</read_first>

<action>
1. Enhance the prompt template in rag.py to include:
   - Role: "You are a helpful visa assistant."
   - Instructions to cite sources from retrieved documents
   - Fallback response when no relevant documents found
2. Add source attribution in response (cite country/visa_type from metadata)
3. Implement conversation history (last 3 exchanges) for context
4. Add error handling for FAISS index not found
5. Create FAISS index seed script if index is empty
</action>

<acceptance_criteria>
- rag.py contains role definition in prompt
- rag.py includes "I don't have information about" fallback message
- rag.py handles missing FAISS index gracefully with error message
- Seed script creates FAISS index with sample visa requirements
</acceptance_criteria>

### Task 2.3: Integrate chatbot with frontend

<read_first>
- frontend/src/components/AiVisaChatbot.js
- frontend/src/components/Chatbot.js
- frontend/src/App.js
</read_first>

<action>
1. Review existing AiVisaChatbot.js component
2. Ensure chatbot component:
   - Has input field for questions
   - Shows chat history with user/bot messages
   - Sends JWT token with chat requests
   - Displays loading indicator during API call
   - Shows error messages for failed requests
3. Add suggested questions (FAQs) for new users:
   - "What documents do I need for a tourist visa?"
   - "How long does visa processing take?"
   - "What is the visa fee?"
4. Style chatbot with responsive design
</action>

<acceptance_criteria>
- AiVisaChatbot.js contains input field with onChange handler
- AiVisaChatbot.js contains send button with click handler
- Chat history displays user messages (right-aligned) and bot responses (left-aligned)
- Loading spinner appears during API call
- "What documents do I need" suggestion button exists
- Error alert displays on API failure
</acceptance_criteria>

### Task 2.4: Seed FAISS with sample data

<read_first>
- backend/seed_db.py
</read_first>

<action>
1. Review existing seed_db.py
2. Create seed script for FAISS index with sample visa requirements:
   - USA tourist visa requirements
   - UK student visa requirements
   - Schengen visa requirements
   - Include country, visa_type, documents list, processing_time
3. Run seed script to populate initial FAISS index
4. Document the indexing process in backend/README.md
</action>

<acceptance_criteria>
- backend/faiss_index/ contains index files
- Sample data includes at least 3 countries
- Each entry has country, visa_type, documents, processing_time
- backend/README.md documents FAISS seeding process
</acceptance_criteria>

## Verification

- RAG pipeline returns relevant responses
- Chatbot UI displays messages correctly
- FAISS index is populated with sample data
- Error handling works for edge cases

## Must-Haves (Goal Verification)

- Employees can ask visa-related questions
- Chatbot retrieves context from FAISS
- Responses include accurate information
- UI is user-friendly and responsive