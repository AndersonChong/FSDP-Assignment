import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import HomePage from './pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Main app */}
        <Route path="/home" element={<HomePage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
