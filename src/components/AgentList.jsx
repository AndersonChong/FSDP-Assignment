import React, { useEffect, useState } from "react";
import "../styles/homepage.css";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AgentList() {
  const navigate = useNavigate();

  // 🔐 Logged-in user
  const currentUser = localStorage.getItem("currentUser");

  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchAgents() {
      const snapshot = await getDocs(collection(db, "agents"));

      // ✅ FILTER BY OWNER
      const userAgents = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((agent) => agent.owner === currentUser);

      setAgents(userAgents.slice(0, 5)); // show recent 5
    }

    fetchAgents();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <p style={{ color: "#6b7280" }}>
        Please sign in to view your agents.
      </p>
    );
  }

  return (
    <div className="agent-section">
      <h3>Recent AI Agents</h3>

      {agents.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No agents created yet.</p>
      ) : (
        <div className="agent-list">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="agent-row"
              onClick={() => navigate(`/agent-chat/${agent.id}`)}
              style={{ cursor: "pointer" }}
            >
              <span>{agent.name}</span>
              <span
                className={
                  agent.isActive === false ? "agent-status idle" : "agent-status active"
                }
              >
                {agent.isActive === false ? "Disabled" : "Active"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
