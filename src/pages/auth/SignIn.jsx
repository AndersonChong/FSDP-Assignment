import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import TextField from '../../components/auth/TextField'
import { validateEmail, validatePassword } from '../../utils/validators'
import './authPages.css'


export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const emailError = useMemo(() => (submitted ? validateEmail(email) : null), [email, submitted])

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setMessage('')

    const err = validateEmail(email)
    if (err) return

    if (!password) {
      setMessage('Please enter your password.')
      return
    }

    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setMessage('Signed in.')
    }, 550)
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Sign in</h1>
      <p className="auth-subtitle">Enter your credentials to continue.</p>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          error={emailError}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          rightSlot={
            <button
              type="button"
              className="toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
        />

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="row">
          <span className="link-muted">No account?</span>
          <Link to="/signup" className="link-muted">Create one</Link>
        </div>

        {message ? <div className="banner">{message}</div> : null}
      </form>
    </AuthLayout>
  )
}
