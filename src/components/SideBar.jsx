import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { useTheme } from '../context/ThemeContext'; 

const SideBar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sidebar">
      <div className="user-profile">
        <div className="user-icon">👤</div>
        <p>User xx2f0</p>
      </div>

      <button className="create-agent-btn" onClick={() => navigate("/create-agent")}>
        + Create New Agent
      </button>

      <div className="menu">
        <button className="menu-btn" onClick={() => navigate("/explore")}>
          Explore
        </button>

        <button className="menu-btn" onClick={() => navigate("/view-agents")}>
          View AI Agents
        </button>
      </div>
      
      <div className="menu" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="menu-btn theme-toggle-btn" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

    </div>
  );
};

export default SideBar;