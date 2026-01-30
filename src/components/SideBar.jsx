import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { useTheme } from "../context/ThemeContext";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";

const SideBar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 🔐 Logged-in user
  const currentUser = localStorage.getItem("currentUser");
  const displayName = currentUser
    ? currentUser.split("@")[0]
    : "Guest";

  // 🧹 Logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUserMenuOpen(false);
    setOpen(false);
    navigate("/signin");
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <FiMenu size={22} />
        </button>
      </div>

      {/* BACKDROP */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => {
            setOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* Mobile close button */}
        <button
          className="sidebar-close-btn"
          onClick={() => {
            setOpen(false);
            setUserMenuOpen(false);
          }}
          aria-label="Close sidebar"
        >
          <FiX size={20} />
        </button>

        {/* USER PROFILE (CLICKABLE) */}
        <div
          className="user-profile"
          onClick={() => setUserMenuOpen((v) => !v)}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <div className="user-icon">👤</div>
          <p>{displayName}</p>

          {/* USER DROPDOWN MENU */}
          {userMenuOpen && currentUser && (
            <div className="user-dropdown">
              <button
                className="user-dropdown-item logout"
                onClick={handleLogout}
              >
                <FiLogOut style={{ marginRight: 8 }} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* CREATE AGENT */}
        <button
          className="create-agent-btn"
          onClick={() => {
            navigate("/create-agent");
            setOpen(false);
            setUserMenuOpen(false);
          }}
        >
          + Create New Agent
        </button>
        {/*create grupchat*/}
        <button
          className="create-agent-btn"
          onClick={() => navigate("/create-group")}
        >
          + Create Group Chat
        </button>

        {/* MENU */}
        <div className="menu">
          <button
            className="menu-btn"
            onClick={() => {
              navigate("/home");
              setOpen(false);
              setUserMenuOpen(false);
            }}
          >
            Home
          </button>

          <button
            className="menu-btn"
            onClick={() => {
              navigate("/view-agents");
              setOpen(false);
              setUserMenuOpen(false);
            }}
          >
            View AI Agents
          </button>
        </div>

        {/* THEME TOGGLE AT BOTTOM */}
        <div
          className="menu"
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <button
            className="menu-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SideBar;
