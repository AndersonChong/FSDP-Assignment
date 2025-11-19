from fastapi import FastAPI
from routes.chat import router as chat_router
from routes.agent import router as agent_router

app = FastAPI(title="AI Agent Engine - Lightweight")

app.include_router(agent_router, prefix="/agents")
app.include_router(chat_router, prefix="/chat")
