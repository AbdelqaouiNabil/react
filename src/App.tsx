import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { supabase } from './lib/supabaseClient'

function App() {
  const [count, setCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const check = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setConnectionStatus('ok')
        // eslint-disable-next-line no-console
        console.log('Supabase session:', data.session)
      } catch (err) {
        setConnectionStatus('error')
        // eslint-disable-next-line no-console
        console.error('Supabase connectivity error:', err)
      }
    }
    check()
  }, [])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setMessage('Magic link sent. Check your email!')
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to send magic link')
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <hr />
      <h2>Supabase</h2>
      <p>
        Connection status: <strong>{connectionStatus}</strong>
      </p>
      <form onSubmit={handleMagicLink} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send magic link</button>
      </form>
      {message && <p>{message}</p>}
    </>
  )
}

export default App
