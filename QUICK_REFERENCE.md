# ⚡ Quick Reference Cheat Sheet

## 🚀 Start Everything (2 PowerShell Windows)

### Window 1: Backend
```powershell
cd c:\Users\Ander\OneDrive\Desktop\FSDP\FSDP-Assignment\backend
.\venv\Scripts\Activate.ps1
$env:OPENAI_API_KEY = "sk-your-key"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceaccount.json"
uvicorn main:app --reload --port 8000
```

### Window 2: Frontend
```powershell
cd c:\Users\Ander\OneDrive\Desktop\FSDP\FSDP-Assignment
npm start
```

---

## 🔗 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend | http://localhost:8000 | FastAPI server |
| Docs | http://localhost:8000/docs | Swagger UI (test endpoints) |
| Firebase | Console.firebase.google.com | Firestore database |

---

## 📝 API Cheat Sheet

### Create Agent
```powershell
$agent = @{name="Bot"; role="Helper"; persona="Friendly"; specialties=@("help"); guidelines="Be nice"}
Invoke-RestMethod -Uri "http://localhost:8000/agents" -Method Post -Body ($agent|ConvertTo-Json -Depth 5) -ContentType "application/json"
```

### Chat
```powershell
$chat = @{agent_id="PASTE_AGENT_ID_HERE"; user_message="Hello!"}
Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method Post -Body ($chat|ConvertTo-Json) -ContentType "application/json"
```

### Submit Feedback
```powershell
$fb = @{chat_id="c1"; message_id="m1"; agent_id="AGENT_ID"; feedback_type="thumbs_up"; user_comment="Good!"}
Invoke-RestMethod -Uri "http://localhost:8000/feedback" -Method Post -Body ($fb|ConvertTo-Json) -ContentType "application/json"
```

### Get Feedback Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/feedback/stats/AGENT_ID" -Method Get
```

### Upload Text KB
```powershell
$kb = @{agent_id="AGENT_ID"; content="Python basics..."; metadata=@{source_type="text"}}
Invoke-RestMethod -Uri "http://localhost:8000/kb/upload" -Method Post -Body ($kb|ConvertTo-Json -Depth 5) -ContentType "application/json"
```

### Upload FAQ
```powershell
$faq = @{agent_id="AGENT_ID"; faq_entries=@(@{question="Q?"; answer="A."})}
Invoke-RestMethod -Uri "http://localhost:8000/kb/faq" -Method Post -Body ($faq|ConvertTo-Json -Depth 10) -ContentType "application/json"
```

### Save Response
```powershell
$save = @{agent_id="AGENT_ID"; user_message="Q?"; bot_response="A."; tags=@("tag1")}
Invoke-RestMethod -Uri "http://localhost:8000/responses/save" -Method Post -Body ($save|ConvertTo-Json -Depth 5) -ContentType "application/json"
```

### Get Saved Responses
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/responses/agent/AGENT_ID" -Method Get
```

### Link Agents
```powershell
$link = @{primary_agent_id="BOT1_ID"; secondary_agent_id="BOT2_ID"}
Invoke-RestMethod -Uri "http://localhost:8000/chains/link" -Method Post -Body ($link|ConvertTo-Json) -ContentType "application/json"
```

### Query Agent Chain
```powershell
$chain = @{primary_agent_id="BOT1_ID"; secondary_agent_id="BOT2_ID"; user_message="Help!"; pass_context=$true}
Invoke-RestMethod -Uri "http://localhost:8000/chains/query" -Method Post -Body ($chain|ConvertTo-Json) -ContentType "application/json"
```

---

## 📂 Important Files

| File | Purpose | Edit if |
|------|---------|---------|
| `backend/main.py` | App entry point | Adding routes |
| `backend/models.py` | Data schemas | Adding new endpoints |
| `backend/db.py` | Database functions | Changing DB logic |
| `backend/routes/*.py` | API endpoints | Modifying endpoints |
| `src/api.js` | Frontend API calls | Changing endpoints |
| `src/pages/ChatInterface.jsx` | Chat UI | Modifying UI |
| `backend/requirements.txt` | Dependencies | Adding libraries |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "CORS error" | CORS is already fixed in main.py |
| "API key missing" | Set `$env:OPENAI_API_KEY` |
| "Firebase not found" | Ensure `serviceaccount.json` at root |
| "Agent not found" | Create agent first via frontend |
| "PyPDF2 not found" | Run `pip install PyPDF2` |
| "Port 8000 in use" | Change port: `uvicorn main:app --port 8001` |

---

## 📊 Database Quick Lookup

| Collection | Purpose | Use When |
|-----------|---------|----------|
| agents | Bot profiles | Retrieving bot info |
| feedback | User ratings | Collecting feedback |
| knowledge_base | Documents/FAQ | Improving responses |
| saved_responses | Bookmarks | User saves responses |
| agent_chains | Bot links | Multi-bot collaboration |

---

## 🎯 Common Tasks

### Task: Add new feedback type
1. Edit `backend/models.py` → `FeedbackType` enum
2. Backend automatically handles it

### Task: Upload PDF
1. Call: `POST /kb/upload-pdf`
2. PDFs auto-convert to text
3. Stored in Firestore

### Task: Make 2 bots work together
1. Create both bots via frontend
2. Call: `POST /chains/link`
3. Call: `POST /chains/query`

### Task: View all feedback
1. Call: `GET /feedback/stats/{agentId}`
2. Returns thumbs up/down counts

### Task: Get bot's saved responses
1. Call: `GET /responses/agent/{agentId}`
2. Optional filter by tags

---

## 🔑 Key Endpoints

```
🤖 Agents:       GET/POST /agents
💬 Chat:         POST /chat
👍 Feedback:     POST/GET /feedback/*
📚 KB:           POST/GET /kb/*
💾 Responses:    POST/GET /responses/*
🔗 Chains:       POST/GET /chains/*
```

---

## 📖 Full Documentation

- `TESTING_GUIDE.md` - Step-by-step testing
- `CHANGES_SUMMARY.md` - All changes made
- `ARCHITECTURE.md` - System design
- `README_FEATURES.md` - Feature overview

---

## ✅ Before Going Live

- [ ] Set `OPENAI_API_KEY`
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Place `serviceaccount.json` at project root
- [ ] Run `pip install -r requirements.txt`
- [ ] Test all endpoints (see TESTING_GUIDE.md)
- [ ] Create test agents and chat
- [ ] Submit feedback to verify
- [ ] Upload KB documents to verify
- [ ] Save responses to verify
- [ ] Test multi-bot chaining

---

## 🚀 Deployment Checklist

- [ ] Backend deployed (Cloud Run/Heroku/AWS)
- [ ] Frontend deployed (Firebase Hosting/Vercel)
- [ ] Environment variables set on server
- [ ] Firestore indexes created (if needed)
- [ ] CORS configured for production URLs
- [ ] API key rotated for production
- [ ] Test all features on production

---

## 💡 Pro Tips

1. **Use Swagger UI** at `/docs` to test endpoints interactively
2. **Check browser console** (F12) for frontend errors
3. **Check uvicorn logs** for backend errors
4. **Test with Postman/Insomnia** for complex requests
5. **Monitor Firestore usage** in Firebase console
6. **Track OpenAI costs** with API key usage

---

## 🎓 Learning Path

1. Start: Create an agent via UI
2. Chat: Send message, see bot respond
3. Feedback: Give 👍/👎 feedback
4. KB: Upload a document
5. Save: Bookmark a response
6. Chain: Create 2 bots + link them
7. Demo: Show all features together

---

Quick Start: `uvicorn main:app --reload --port 8000` + `npm start` ✨
