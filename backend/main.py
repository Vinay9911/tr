import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from groq import Groq
from models import TodoCreate, TodoUpdate, AIRequest

load_dotenv()

app = FastAPI()

# CORS Setup (Allow Next.js frontend to talk to FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Clients
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

# --- Todo Endpoints ---

@app.get("/todos/{user_id}")
def get_todos(user_id: str):
    response = supabase.table("todos").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

@app.post("/todos")
def create_todo(todo: TodoCreate):
    response = supabase.table("todos").insert({"title": todo.title, "user_id": todo.user_id}).execute()
    return response.data[0]

@app.put("/todos/{todo_id}")
def update_todo(todo_id: str, todo: TodoUpdate):
    data = {k: v for k, v in todo.dict().items() if v is not None}
    response = supabase.table("todos").update(data).eq("id", todo_id).execute()
    return response.data

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: str):
    response = supabase.table("todos").delete().eq("id", todo_id).execute()
    return {"message": "Deleted"}

# --- AI Endpoint ---

@app.post("/generate-task")
def generate_ai_task(request: AIRequest):
    """
    Analyzes current todos and suggests the next logical task using Llama-3.
    """
    todo_list_text = "\n".join([f"- {t}" for t in request.current_todos])
    
    prompt = f"""
    Here is a user's current todo list:
    {todo_list_text}

    Based on this list, suggest exactly ONE short, actionable, and logical next task they should add.
    Do not output any explanation, just the task title.
    """

    chat_completion = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a productivity assistant."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.5,
    )

    suggestion = chat_completion.choices[0].message.content.strip()
    return {"suggestion": suggestion}