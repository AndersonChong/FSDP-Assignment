import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/SideBar";
import KnowledgeBase from "../components/KnowledgeBase";
import AgentChaining from "../components/AgentChaining";
import "../styles/chatinterface.css";
import {
  FiArrowLeft,
  FiEdit2,
  FiSend,
  FiUpload,
  FiThumbsUp,
  FiThumbsDown
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { queryAgent, queryAgentChain } from "../api"; // <-- backend chat call

// Auto-suggest agent based on user message
function suggestAgentsFromMessage(message, agents, currentAgentId) {
  if (!message || agents.length === 0) return [];

  const text = message.toLowerCase();

  // Track which specialties are already covered
  const matchedSpecialties = new Set();
  const suggestions = [];

  for (const agent of agents) {
    // Never suggest current agent
    if (agent.id === currentAgentId) continue;
    if (!agent.specialties) continue;

    for (const rawKeyword of agent.specialties) {
      const keyword = rawKeyword.toLowerCase();

      // keyword appears in message AND not already suggested
      if (
        text.includes(keyword) &&
        !matchedSpecialties.has(keyword)
      ) {
        matchedSpecialties.add(keyword);

        suggestions.push({
          agentId: agent.id,
          label: agent.name,
          reason: `Matches: ${keyword}`
        });

        // move to next agent after first specialty match
        break;
      }
    }
  }

  return suggestions;
}

export default function ChatInterface() {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [allAgents, setAllAgents] = useState([]);
  const [agentSuggestions, setAgentSuggestions] = useState([]);

  const [showKB, setShowKB] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const [chainMode, setChainMode] = useState(false);
  const [secondaryAgent, setSecondaryAgent] = useState(null);


  // Fetch agent metadata from Firestore
  useEffect(() => {
    async function loadAgent() {
      try {
        const snap = await getDoc(doc(db, "agents", agentId));
        if (snap.exists()) {
          const data = snap.data();
          setAgent(data);

          await updateDoc(doc(db, "agents", agentId), {
            lastUsedAt: serverTimestamp(),
          });

          // Initial greeting message from bot
          setMessages([
            {
              id: `greeting_${Date.now()}`,
              sender: "bot",
              text: `Hi User, I am ${data.name}. How can I help you today?`,
            },
          ]);
        } else {
          alert("Agent not found in database.");
        }
      } catch (err) {
        console.error("Error fetching agent:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAgent();
  }, [agentId]);

    useEffect(() => {
  async function loadAgentsForSuggestion() {
    const snap = await getDocs(collection(db, "agents"));
    const list = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((a) => a.isActive !== false);
    setAllAgents(list);
  }

  loadAgentsForSuggestion();
  }, []);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

  const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const prepareFileForFirestore = async (file) => {
  if (file.size > 1024 * 1024) {
    alert("File too large (max 1MB)");
    return null;
  }
  const base64 = await fileToBase64(file);
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    base64,
    previewType: file.type.startsWith("image/")
      ? "image"
      : "file",
  };
};

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎥";
    if (fileType === "application/pdf") return "📄";
    return "📎";
  };

  // Send message to backend and get AI response
const sendMessage = async () => {
  if (!input.trim() && !selectedFile) return;

  const userMessage = input;
  setInput("");

  let fileData = null;
  if (selectedFile) {
    fileData = await prepareFileForFirestore(selectedFile);
    setSelectedFile(null);
    setFilePreview(null);
  }

  setMessages((prev) => [
    ...prev,
    { sender: "user", text: userMessage, file: fileData }
  ]);

  await addDoc(collection(db, "messages"), {
    agentId,
    sender: "user",
    sessionId,
    text: userMessage,
    file: fileData,
    createdAt: serverTimestamp(),
  });

try {
  let res;

  if (chainMode && secondaryAgent) {
    res = await queryAgentChain(
      agentId,
      secondaryAgent.id,
      userMessage,
      true
    );
  } else {
    res = await queryAgent(
      agentId,
      userMessage,
      fileData?.base64 || null
    );
  }

  const aiText = res.reply;

  if (!aiText) {
    throw new Error("AI text is empty");
  }

  const aiDocRef = await addDoc(collection(db, "messages"), {
    agentId,
    sender: "ai",
    sessionId,
    text: aiText,
    createdAt: serverTimestamp(),
  });

  setMessages((prev) => [
    ...prev,
    {
      id: aiDocRef.id,
      sender: "bot",
      text: aiText,
      messageId: aiDocRef.id,
    },
  ]);
} catch (err) {
  console.error("Error sending message:", err);
  setMessages((prev) => [
    ...prev,
    {
      sender: "bot",
      text: "Sorry, something went wrong.",
    },
  ]);
}
};


    const submitFeedback = async (messageId, satisfied) => {
    await addDoc(collection(db, "feedback"), {
      messageId,
      agentId,
      sessionId,
      satisfied,
      createdAt: serverTimestamp(),
    });
  };

  const hasFeedback = async (messageId) => {
    const q = query(
      collection(db, "feedback"),
      where("messageId", "==", messageId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  };

  if (loading) return <div>Loading agent...</div>;
  if (!agent) return <div>Agent not found.</div>;

  return (
    <div className="chat-layout">
      <Sidebar />

      <div className="chat-panel">
        {/* === AGENT HEADER === */}
        <div className="agent-header">
          <button className="back-btn" onClick={() => navigate("/view-agents")}>
            <FiArrowLeft size={20} />
          </button>

          <div className="agent-header-info">
            <div
              className="agent-avatar"
              style={{ backgroundColor: agent.color }}
            >
              {agent.icon || "🤖"}
            </div>

            <div className="agent-meta">
              <h2>{agent.name}</h2>
              <p>Created by User</p>
            </div>
          </div>

          <div className="agent-header-actions">
            <button 
              className="edit-btn"
              onClick={() => alert("Edit feature coming soon!")}
              title="Edit agent"
            >
              <FiEdit2 size={18} /> Edit
            </button>
            <button
              className="kb-btn"
              onClick={() => setShowKB(!showKB)}
              title="Manage Knowledge Base"
            >
              📚 KB
            </button>
            {/* <AgentChaining primaryAgentId={agentId} /> */}
            <AgentChaining
              primaryAgentId={agentId}
              onChainSelected={({ enabled, secondaryAgent }) => {
                setChainMode(enabled);
                setSecondaryAgent(secondaryAgent);
              }}
            />
            <button className="chat-btn">
              <FiSend size={18} /> Chat
            </button>
          </div>
        </div>

        {/* === KNOWLEDGE BASE PANEL === */}
        {showKB && <KnowledgeBase agentId={agentId} />}

        {/* === CHAT MESSAGES === */}
                <div className="messages-container">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              msg={msg}
              submitFeedback={submitFeedback}
              hasFeedback={hasFeedback}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* === INPUT BOX === */}
        <div className="input-area">
        
          {/* 🔗 CHAIN MODE INDICATOR */}
          {chainMode && secondaryAgent && (
            <div className="chain-pill">
              <span className="chain-icon">🔗</span>
              <span className="chain-text">
                Chaining with <strong>{secondaryAgent.name}</strong>
              </span>
              <button
                className="chain-close"
                onClick={() => {
                  setChainMode(false);
                  setSecondaryAgent(null);
                }}
                aria-label="Disable chaining"
              >
                ✕
              </button>
            </div>
          )}

          {agentSuggestions.length > 0 && (
            <div className="agent-suggestion-list">

              {/*  Ignore ALL suggestions */}
              <div className="suggestion-list-header">
                <span> Suggested agents</span>
                <button
                  className="ignore-all-btn"
                  onClick={() => setAgentSuggestions([])}
                  title="Ignore all suggestions"
                >
                  ✕
                </button>
              </div>

              {agentSuggestions.map((s) => (
                <div key={s.agentId} className="agent-suggestion-card">
                  <div className="suggestion-header">
                     <strong>{s.label}</strong>
                  </div>

                  <p className="suggestion-reason">{s.reason}</p>

                  <div className="suggestion-actions">
                    <button
                      onClick={() => {
                        navigate(`/agent-chat/${s.agentId}`);
                        setAgentSuggestions([]);
                      }}
                    >
                      Use {s.label}
                    </button>

                    <button
                      className="ignore-btn"
                      onClick={() =>
                        setAgentSuggestions((prev) =>
                          prev.filter((a) => a.agentId !== s.agentId)
                        )
                      }
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {selectedFile && (
          <div className="file-preview-card">
            {filePreview?.type === "image" ? (
              <img src={filePreview.url} alt="preview" />
            ) : (
              <div className="file-card">
                <div className="file-icon">
                  {getFileIcon(selectedFile.type)}
                </div>

                <div className="file-meta">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            )}

            <button
              className="remove-file"
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
              }}
            >
              ✕
            </button>
          </div>
        )}

          <div className="input-box">
            {/* 📎 File upload */}
            <label className="input-icon upload-icon">
              <FiUpload size={20} />
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setSelectedFile(file);

                  if (file.type.startsWith("image/")) {
                    setFilePreview({
                      type: "image",
                      url: URL.createObjectURL(file),
                    });
                  } else {
                    setFilePreview({
                      type: "file",
                    });
                  }
                }}
              />
            </label>

            {/* Text input */}
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                setInput(value);

                const suggestions = suggestAgentsFromMessage(
                  value,
                  allAgents,
                  agentId // current chat agent
                );

                setAgentSuggestions(suggestions);

              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {/* Send button */}
            <button className="send-btn" onClick={sendMessage}>
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, submitFeedback, hasFeedback }) {
  const [rated, setRated] = useState(false);

  useEffect(() => {
    if (msg.id && msg.sender === "bot") {
      hasFeedback(msg.id).then(setRated).catch(() => setRated(false));
    }
  }, [msg.id, msg.sender, hasFeedback]);

  // Show feedback buttons for all bot messages with ID that haven't been rated
  const canShowFeedback = msg.sender === "bot" && msg.id && !rated;

  return (
    <div className={`message ${msg.sender === "user" ? "user" : "bot"}`}>
      {msg.text && msg.sender === "bot" && (
        <div className="bot-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.text}
          </ReactMarkdown>
        </div>
      )}

      {msg.text && msg.sender === "user" && (
        <span>{msg.text}</span>
      )}
      {msg.chainMeta && (
        <div className="agent-meta-hint">
          Combined using {msg.chainMeta.primary} + {msg.chainMeta.secondary}
        </div>
      )}

      {/*FILE MESSAGE*/}
      {msg.file && (
        <div className="file-card">
          {msg.file.previewType === "image" ? (
            <img
              src={msg.file.base64}
              alt={msg.file.name}
              className="file-image"
            />
          ) : (
            <>
              <div className="file-icon">📎</div>
              <div className="file-meta">
                <div className="file-name">{msg.file.name}</div>
                <div className="file-size">
                  {(msg.file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/*FEEDBACK (AI ONLY)*/}
      {canShowFeedback && !rated && (
        <div className="feedback">
          <button
            className="feedback-btn"
            title="Helpful"
            onClick={() => {
              submitFeedback(msg.id, true);
              setRated(true);
            }}
          >
            <FiThumbsUp size={16} />
          </button>

          <button
            className="feedback-btn"
            title="Not helpful"
            onClick={() => {
              submitFeedback(msg.id, false);
              setRated(true);
            }}
          >
            <FiThumbsDown size={16} />
          </button>
        </div>
      )}

      {rated && msg.sender === "bot" && (
        <small className="feedback-done">Thanks for your feedback!</small>
      )}
    </div>
  );
}
