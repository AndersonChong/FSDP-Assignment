Backend (FastAPI) - Lightweight AI Agent Engine
------------------------------------------------

Quick start:

1. Create and activate Python virtual environment:
   python -m venv venv
   # Windows (PowerShell)
   venv\Scripts\Activate.ps1
   # Windows (cmd)
   venv\Scripts\activate
   # mac/Linux
   source venv/bin/activate

2. Install requirements:
   pip install -r requirements.txt

3. Set OPENAI_API_KEY environment variable:
   # PowerShell:
   $env:OPENAI_API_KEY = 'your_openai_key'
   # Linux/mac:
   export OPENAI_API_KEY='your_openai_key'

4. Run server:
   uvicorn main:app --reload --port 8000

5. Endpoints:
   POST /agents       -> create agent (name, role, persona, specialties, guidelines)
   GET  /agents       -> list agents
   POST /chat         -> chat (agent_id, user_message)

Note: This version uses a simple local JSON file (agents.json) as the DB (no Firestore).
