import os
import time  # Added for timestamps
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

# LangChain & Gemini Imports
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# --- 1. CONFIGURATION ---
load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title="Multi-User Gemini RAG")

embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2")
vector_store = Chroma(
    collection_name="multi_user_rag_db",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)

# Using temperature 0.1 for factual consistency
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.1)

# --- 2. RAG LOGIC ---
template = """
You are a helpful, intelligent AI assistant. Use the provided context to answer the question.
If the context includes timestamps, use them to determine which information is most recent.

Context:
{context}

Question: 
{question}

Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

def format_docs(docs):
    # Enhanced format_docs to include metadata in the text so the LLM can "see" the time
    formatted = []
    for doc in docs:
        ts = doc.metadata.get("timestamp", "Unknown Time")
        content = f"[Posted on: {ts}]\n{doc.page_content}"
        formatted.append(content)
    return "\n\n---\n\n".join(formatted)

# --- 3. MODELS ---
class DocumentInput(BaseModel):
    text: str
    metadata: dict = {}

class QueryInput(BaseModel):
    prompt: str

# --- 4. ROUTES ---

@app.post("/ingest", tags=["Security"])
async def ingest(doc: DocumentInput, x_user_id: str = Header(...)):
    print(f">>> [INGEST] User: {x_user_id}")
    try:
        enriched_metadata = doc.metadata.copy()
        enriched_metadata["user_id"] = x_user_id
        
        # FIX 1: Ensure a timestamp exists for chronological sorting
        if "timestamp" not in enriched_metadata:
            enriched_metadata["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
        
        new_doc = Document(page_content=doc.text, metadata=enriched_metadata)
        vector_store.add_documents([new_doc])
        
        return {"status": "success", "timestamp": enriched_metadata["timestamp"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask", tags=["Security"])
async def ask(query: QueryInput, x_user_id: str = Header(...)):
    print(f">>> [QUERY] User: {x_user_id} | Prompt: {query.prompt}")
    try:
        # FIX 2: Increased K to 10 so recent items are more likely to be retrieved
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 10, 
                "filter": {"user_id": x_user_id}
            }
        )

        chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

        response = chain.invoke(query.prompt)
        return {"user_id": x_user_id, "answer": response}
    except Exception as e:
        print(f"!!! [ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)