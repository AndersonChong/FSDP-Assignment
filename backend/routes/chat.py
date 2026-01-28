from fastapi import APIRouter, HTTPException
from .. import db
import os
import openai
from openai import OpenAI
from ..models import ChatRequest
from dotenv import load_dotenv
import asyncio
from fastapi import Response

load_dotenv()
router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=10
)

def build_system_prompt(agent: dict) -> str:
    specialties = ", ".join(agent.get("specialties", []))
    persona = agent.get("persona", "")
    summary = agent.get("summary", "")
    name = agent.get("name", "AI Assistant")

    return f"""
    You are an AI assistant named {name}.

    LANGUAGE RULE (VERY IMPORTANT):
    - Always respond in the SAME language as the user's question
    - If the user switches languages, switch with them
    - Do NOT mention language detection

    Persona:
    {persona}

    Summary:
    {summary}

    Specialties:
    {specialties}

    STRICT DOMAIN RULES (VERY IMPORTANT):
    - You MUST ONLY answer questions directly related to your specialties.
    - If a question is NOT related to your specialties:
    - You MUST politely refuse.
    - You MUST NOT answer the question.
    - You MUST NOT give tips, examples, or partial help.
    - You MUST suggest what you CAN help with instead.
    - Do NOT guess.
    - Do NOT stretch your expertise.
    - Do NOT answer "just to be helpful".

    Response style rules:
    - Sound like a friendly human, not a robot.
    - Keep responses short and conversational.
    - Do NOT use bullet points unless explicitly asked.
    - Use at most ONE emoji if it feels natural.
    - Always end with exactly ONE gentle follow-up question.
    - The follow-up question must be on its own line.

    If the user uploads an image:
    - Describe what you see first.
    - ONLY continue if the image is related to your specialties.
    """

def get_agent_sync(agent_id: str):
    return db.get_agent_by_id(agent_id)

def call_openai_sync(system_prompt, user_text, image_base64=None):
    content = []

    if user_text:
        content.append({
            "type": "input_text",
            "text": user_text
        })

    if image_base64:
        content.append({
            "type": "input_image",
            "image_url": image_base64
        })

    response = client.responses.create(
        model="gpt-4.1",
        input=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "input_text",
                        "text": system_prompt
                    }
                ]
            },
            {
                "role": "user",
                "content": content
            }
        ],
        max_output_tokens=300,
    )

    return response.output_text

@router.post("/query")
async def chat(req: ChatRequest):
    agent = await asyncio.to_thread(get_agent_sync, req.agent_id)

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    reply = await asyncio.to_thread(
        call_openai_sync,
        build_system_prompt(agent),
        req.user_message,
        req.image_base64
    )

    return {"reply": reply}


