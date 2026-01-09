from dotenv import load_dotenv
load_dotenv(override=True)

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.agent import router as agent_router
from backend.routes.chat import router as chat_router

app = FastAPI(title="AI Agent Engine - Lightweight")

app.include_router(agent_router, prefix="/agent")
app.include_router(chat_router, prefix="/agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

