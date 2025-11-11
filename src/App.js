import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateAgentPage from "./pages/CreateAgent";
import UserForm from "./components/UserForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-agent" element={<CreateAgentPage />} />
        <Route path="/test" element={<UserForm />} />
      </Routes>
    </Router>
  );
}

export default App;
