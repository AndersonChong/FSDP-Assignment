from fastapi import APIRouter, HTTPException
from models import ChatRequest
import db
import os
import openai

router = APIRouter()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    # openai will error if not set; we keep it optional so user gets clear message later
    pass
openai.api_key = OPENAI_API_KEY

def build_system_prompt(agent: dict) -> str:
    specialties = ", ".join(agent.get("specialties", [])) or "general knowledge"
    guidelines = agent.get("guidelines","")
    prompt = f"""You are {agent.get('name')} — Role: {agent.get('role')}.
Persona / guidelines: {guidelines}
Specialties: {specialties}

ALWAYS follow the persona and role above. If asked something outside your specialties, politely say you can only discuss your specialty.
"""
    return prompt

@router.post("/")
async def chat(req: ChatRequest):
    agent = db.get_agent_by_id(req.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    system_prompt = build_system_prompt(agent)
    user_message = req.user_message

    # Build messages for OpenAI ChatCompletion
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured in backend (set OPENAI_API_KEY)")

    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=512,
        temperature=0.7
    )
    answer = resp['choices'][0]['message']['content']
    return {"reply": answer}
