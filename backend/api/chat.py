from fastapi import APIRouter, HTTPException, Response
from models import ChatRequest
import db
import os
import openai

router = APIRouter()

# OpenAI API Key
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY


def build_system_prompt(agent: dict) -> str:
    specialties = ", ".join(agent.get("specialties", [])) or "general knowledge"
    guidelines = agent.get("guidelines", "")
    return (
        f"You are {agent.get('name')} — Role: {agent.get('role')}.\n"
        f"Persona / guidelines: {guidelines}\n"
        f"Specialties: {specialties}\n"
    )


# ⭐ EXPLICIT OPTIONS ROUTE — REQUIRED FOR CORS
@router.options("/")
async def chat_options():
    return Response(status_code=200)


# ⭐ NORMAL POST CHAT ENDPOINT
@router.post("/")
async def chat(req: ChatRequest):

    agent = db.get_agent_by_id(req.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    messages = [
        {"role": "system", "content": build_system_prompt(agent)},
        {"role": "user", "content": req.user_message},
    ]

    if not openai.api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key is not configured"
        )

    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=256,
        temperature=0.7,
    )

    return {"reply": resp["choices"][0]["message"]["content"]}
