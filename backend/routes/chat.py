from fastapi import APIRouter, HTTPException, Response
from backend.models import ChatRequest
from backend import db
import os
import asyncio
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=10
)

def build_system_prompt(agent: dict) -> str:
    return (
        f"You are {agent.get('name')}.\n"
        f"Role: {agent.get('role')}.\n"
        f"Persona: {agent.get('persona')}\n"
        f"Specialties: {', '.join(agent.get('specialties', []))}"
    )

@router.options("/query")
async def chat_options():
    return Response(status_code=200)

def get_agent_sync(agent_id: str):
    return db.get_agent_by_id(agent_id)

def call_openai_sync(messages):
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=250,
    )
    return response.choices[0].message.content

@router.post("/query")
async def chat(req: ChatRequest):
    print("Chat endpoint hit")
    print("Incoming request:", req.agent_id, req.user_message)

    try:
        agent = await asyncio.to_thread(get_agent_sync, req.agent_id)
    except Exception as e:
        print("Firestore error:", e)
        raise HTTPException(status_code=500, detail="Firestore error")

    print("Agent fetched:", agent)

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    messages = [
        {"role": "system", "content": build_system_prompt(agent)},
        {"role": "user", "content": req.user_message},
    ]

    try:
        reply = await asyncio.wait_for(
            asyncio.to_thread(call_openai_sync, messages),
            timeout=8
        )
        print("OpenAI replied")
        return {"reply": reply}

    except asyncio.TimeoutError:
        return {"reply": "AI response timed out. Please try again."}

    except Exception as e:
        print("OpenAI error:", e)
        return {"reply": "AI service error."}

