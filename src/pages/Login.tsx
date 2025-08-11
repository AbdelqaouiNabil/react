import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const { signInWithPassword, signUpWithPassword, role, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    if (user && role) {
      navigate(role === 'admin' ? '/admin' : '/student', { replace: true })
    }
  }, [user, role, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password)
      } else {
        await signUpWithPassword(email, password)
      }
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card stack">
        <h1>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h1>
        <form onSubmit={onSubmit} className="form">
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="row">
            <button className="btn" type="submit">{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
            <button className="btn secondary" type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>
        </form>
        {error && <p className="muted" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>
    </div>
  )
}
