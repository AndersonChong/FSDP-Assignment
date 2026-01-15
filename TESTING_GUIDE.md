# 🤖 Complete Testing Guide - Full Integration Setup

## What Was Fixed
1. ✅ **CORS** added to backend (frontend can now call backend)
2. ✅ **API endpoint mismatch** fixed (`/agents/query` → `/chat`)
3. ✅ **4 Major Features Implemented:**
   - 👍/👎 Feedback System with user comments
   - 📚 Knowledge Base Upload (PDF, text, URLs, FAQ)
   - 💾 Response Saving/Bookmarking
   - 🔗 Multi-Bot Linking & Chaining

---

## System Architecture Flow

```
User Frontend (React)
        ↓
   [Create Agent]
        ↓
Firestore Database ← Agent stored here
        ↓
   [Send Message]
        ↓
Backend FastAPI
        ↓
[Retrieve Agent + KB] → Firestore
        ↓
[Generate Response] → OpenAI API (gpt-4o-mini)
        ↓
[Store Response] → Firestore (optional)
        ↓
[Return to Frontend]
        ↓
User Sees Bot Response
```

---

## Pre-Setup Requirements

1. **Python 3.8+** installed
2. **Node.js 16+** installed
3. **Firebase Service Account JSON** at project root: `firebase/serviceaccount.json`
4. **OpenAI API Key** in environment: `OPENAI_API_KEY`

---

## Step 1: Install Backend Dependencies

Open PowerShell in `c:\Users\Ander\OneDrive\Desktop\FSDP\FSDP-Assignment\backend`

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install all dependencies (including new ones: PyPDF2, requests, beautifulsoup4)
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi uvicorn openai pydantic google-cloud-firestore firebase-admin PyPDF2 requests beautifulsoup4 python-dotenv ...
```

---

## Step 2: Set Environment Variables (PowerShell)

```powershell
# Set OpenAI API Key
$env:OPENAI_API_KEY = "your_openai_key_here"

# Set Firebase credentials path
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\Ander\OneDrive\Desktop\FSDP\FSDP-Assignment\firebase\serviceaccount.json"

# Verify
Write-Output "API Key: $env:OPENAI_API_KEY"
Write-Output "Firebase Creds: $env:GOOGLE_APPLICATION_CREDENTIALS"
```

---

## Step 3: Start Backend Server

```powershell
# Make sure venv is activated
cd backend

# Start uvicorn
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

✅ Backend is now running at `http://localhost:8000`

---

## Step 4: Start Frontend Server

Open a **NEW PowerShell window** in the project root

```powershell
cd c:\Users\Ander\OneDrive\Desktop\FSDP\FSDP-Assignment

npm install  # Install frontend dependencies if not already done

npm start    # or npm run dev
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

✅ Frontend is now running at `http://localhost:3000`

---

## FULL SYSTEM TEST (End-to-End)

### Test 1: Create an Agent (Create Agent Page)

1. Open frontend: `http://localhost:3000`
2. Click **"Create Agent"** or go to `/create-agent`
3. Fill in:
   - **Name**: "Tech Support Bot"
   - **Role**: "Technical Support Specialist"
   - **Persona**: "Friendly and helpful tech expert"
   - **Specialties**: ["JavaScript", "Python", "Debugging"]
   - **Guidelines**: "Always explain technical concepts simply"
4. Click **Create**

**Expected:**
- ✅ Agent appears in Firestore: `agents` collection
- ✅ Redirects to chat page
- ✅ Agent greeting appears: "Hi User, I am Tech Support Bot. How can I help you today?"

---

### Test 2: Chat with Agent (Test OpenAI Integration)

1. In the chat page, type: **"How do I debug a JavaScript error?"**
2. Click send

**Expected:**
- ✅ Message appears in chat (user side)
- ✅ Bot thinks for ~2 seconds
- ✅ AI response appears (from OpenAI gpt-4o-mini)
- ✅ Response stored in Firestore: `agents` collection

**Response should be something like:**
```
"To debug a JavaScript error:
1. Check the browser console (F12 → Console tab)
2. Look for red error messages...
[full response]"
```

---

### Test 3: Feedback System (👍/👎)

**Add thumbs up button to ChatInterface.jsx first** (see below), then:

1. User receives bot response
2. Click **👍 Thumbs Up** button
3. Optional: Add comment: "Great answer!"

**Expected:**
- ✅ Feedback stored in Firestore: `feedback` collection
- ✅ Response: `{"status": "success", "feedback_id": "..."}`

**Test Backend Directly (PowerShell):**

```powershell
$feedback = @{
    chat_id = "chat_123"
    message_id = "msg_456"
    agent_id = "your_agent_id"
    feedback_type = "thumbs_up"
    user_comment = "Perfect response!"
}

$json = $feedback | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/feedback" -Method Post -Body $json -ContentType "application/json"
```

**Expected response:**
```json
{
  "status": "success",
  "feedback_id": "chat_123_msg_456",
  "message": "Feedback submitted successfully"
}
```

---

### Test 4: Knowledge Base Upload

#### Option A: Upload Text

```powershell
$kbData = @{
    agent_id = "your_agent_id"
    content = "Python is a programming language. FAQ: Q: How to install Python? A: Download from python.org"
    metadata = @{
        source_type = "text"
        file_name = "python_basics.txt"
    }
}

$json = $kbData | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri "http://localhost:8000/kb/upload" -Method Post -Body $json -ContentType "application/json"
```

**Expected:**
```json
{
  "status": "success",
  "document_id": "abc123xyz",
  "message": "Document uploaded successfully"
}
```

#### Option B: Upload FAQ

```powershell
$faqData = @{
    agent_id = "your_agent_id"
    faq_entries = @(
        @{ question = "What is Python?"; answer = "A programming language"; category = "Basics" },
        @{ question = "How to install?"; answer = "Download from python.org"; category = "Setup" }
    )
}

$json = $faqData | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "http://localhost:8000/kb/faq" -Method Post -Body $json -ContentType "application/json"
```

**Expected:**
```json
{
  "status": "success",
  "faq_count": 2,
  "message": "Added 2 FAQ entries"
}
```

#### Option C: Ingest from URL

```powershell
$urlData = @{
    agent_id = "your_agent_id"
    url = "https://www.python.org"
}

$json = $urlData | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/kb/upload-url" -Method Post -Body $json -ContentType "application/json"
```

---

### Test 5: Response Saving

```powershell
$saveData = @{
    agent_id = "your_agent_id"
    user_message = "How to debug JavaScript?"
    bot_response = "To debug JavaScript: 1. Open console... 2. Set breakpoints..."
    tags = @("javascript", "debugging", "useful")
}

$json = $saveData | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri "http://localhost:8000/responses/save" -Method Post -Body $json -ContentType "application/json"
```

**Expected:**
```json
{
  "status": "success",
  "response_id": "resp_abc123",
  "message": "Response saved successfully"
}
```

**Retrieve saved responses:**

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/responses/agent/your_agent_id" -Method Get
```

**Expected:**
```json
{
  "agent_id": "your_agent_id",
  "count": 1,
  "responses": [
    {
      "user_message": "How to debug JavaScript?",
      "bot_response": "...",
      "tags": ["javascript", "debugging", "useful"],
      "created_at": "2026-01-14T10:30:45.123456"
    }
  ]
}
```

---

### Test 6: Multi-Bot Linking (🔗)

**Step 1: Create a second agent** (e.g., "Code Reviewer Bot")

**Step 2: Link agents:**

```powershell
$linkData = @{
    primary_agent_id = "tech_bot_id"
    secondary_agent_id = "reviewer_bot_id"
}

$json = $linkData | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/chains/link" -Method Post -Body $json -ContentType "application/json"
```

**Expected:**
```json
{
  "status": "success",
  "chain_id": "chain_xyz",
  "primary_agent": "Tech Support Bot",
  "secondary_agent": "Code Reviewer Bot",
  "message": "Agents linked successfully"
}
```

**Step 3: Query agent chain (both agents respond):**

```powershell
$chainQuery = @{
    primary_agent_id = "tech_bot_id"
    secondary_agent_id = "reviewer_bot_id"
    user_message = "Review my JavaScript code: function add(a,b){ return a + b; }"
    pass_context = $true
}

$json = $chainQuery | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/chains/query" -Method Post -Body $json -ContentType "application/json"
```

**Expected:**
```json
{
  "user_message": "Review my code...",
  "primary_agent": {
    "name": "Tech Support Bot",
    "response": "This function adds two numbers..."
  },
  "secondary_agent": {
    "name": "Code Reviewer Bot",
    "response": "The function is simple and correct..."
  },
  "combined_response": "Tech Support Bot: ...\n\nCode Reviewer Bot: ..."
}
```

---

## Frontend Components to Add

### 1. Feedback Component (Add to ChatInterface.jsx)

Add these buttons below each bot message:

```jsx
<div className="message-feedback">
  <button onClick={() => handleFeedback(messageId, 'thumbs_up')}>👍</button>
  <button onClick={() => handleFeedback(messageId, 'thumbs_down')}>👎</button>
  <button onClick={() => handleFeedback(messageId, 'flag_incorrect')}>🚩 Flag</button>
  <textarea 
    placeholder="Optional comment..." 
    onChange={(e) => setFeedbackComment(e.target.value)}
  />
</div>
```

### 2. KB Upload Modal (Add to agent pages)

```jsx
<div className="kb-upload">
  <input type="file" onChange={handleFileUpload} accept=".pdf,.txt" />
  <input type="text" placeholder="URL to ingest..." />
  <button onClick={handleUpload}>Upload to Knowledge Base</button>
</div>
```

### 3. Save Response Button (Add to ChatInterface.jsx)

```jsx
<button onClick={() => saveResponse(userMsg, botMsg, ['tag1', 'tag2'])}>
  💾 Save Response
</button>
```

### 4. Multi-Bot Chat (Add new page: MultiAgentChat.jsx)

```jsx
<div className="multi-agent">
  <select onChange={(e) => setPrimaryAgent(e.target.value)}>
    <option>Select Primary Agent</option>
    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
  </select>
  
  <select onChange={(e) => setSecondaryAgent(e.target.value)}>
    <option>Select Secondary Agent</option>
    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
  </select>
  
  <button onClick={handleChainQuery}>Get Both Perspectives</button>
</div>
```

---

## Troubleshooting

### ❌ "CORS error - blocked by browser"
**Fix:** Ensure CORS middleware is in main.py (it's added now)

### ❌ "OpenAI API key missing"
**Fix:** Set `OPENAI_API_KEY` in PowerShell:
```powershell
$env:OPENAI_API_KEY = "sk-..."
```

### ❌ "Firebase credentials not found"
**Fix:** Ensure `firebase/serviceaccount.json` exists at project root

### ❌ "Agent not found" in chat
**Fix:** Make sure agent was created in Firestore first

### ❌ "PDF upload fails"
**Fix:** Ensure PyPDF2 is installed:
```powershell
pip install PyPDF2
```

---

## Demo Narrative: Showing How It Works

### Scenario: "Show how feedback improves responses"

**Step 1:** User types bad question → Bot gives OK response
**Step 2:** User clicks 👎 and comments: "This answer was incomplete"
**Step 3:** Admin views feedback stats: `GET /feedback/stats/{agent_id}`
**Step 4:** Admin improves knowledge base → adds missing info
**Step 5:** New user asks same question → Bot gives better response
**Step 6:** User clicks 👍 and comments: "Perfect!"

**This shows:**
- ✅ Feedback collected
- ✅ Stats improved
- ✅ KB helped bot give better answer

---

## All Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/agents` | Create agent |
| GET | `/agents` | List all agents |
| GET | `/agents/{id}` | Get single agent |
| POST | `/chat` | Send message to bot |
| POST | `/feedback` | Submit feedback |
| GET | `/feedback/agent/{id}` | Get feedback for agent |
| GET | `/feedback/stats/{id}` | Get feedback stats |
| POST | `/kb/upload` | Upload KB document |
| POST | `/kb/upload-pdf` | Upload PDF |
| POST | `/kb/upload-text` | Upload text |
| POST | `/kb/upload-url` | Ingest from URL |
| POST | `/kb/faq` | Upload FAQ |
| GET | `/kb/agent/{id}` | Get KB documents |
| POST | `/responses/save` | Save response |
| GET | `/responses/agent/{id}` | Get saved responses |
| POST | `/chains/link` | Link two agents |
| POST | `/chains/query` | Query agent chain |
| GET | `/chains/chains/{id}` | Get agent chains |

---

## Next Steps

1. **Add feedback buttons to ChatInterface.jsx**
2. **Create KB upload modal component**
3. **Add save response button**
4. **Create MultiAgentChat page**
5. **Test all endpoints with PowerShell commands above**
6. **Deploy to Firebase Hosting** (see Firebase docs)

Enjoy your AI Agent Platform! 🚀
