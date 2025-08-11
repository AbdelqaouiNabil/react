import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [stats, setStats] = useState<{ ausbildung_main_engine: number; bewerbungen: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      const [aCountRes, bCountRes] = await Promise.all([
        supabase.from('ausbildung_main_engine').select('*', { count: 'exact', head: true }),
        supabase.from('bewerbungen').select('*', { count: 'exact', head: true }),
      ])
      if (aCountRes.error || bCountRes.error) {
        setError(aCountRes.error?.message || bCountRes.error?.message || 'Failed to load stats')
      } else {
        setStats({
          ausbildung_main_engine: aCountRes.count ?? 0,
          bewerbungen: bCountRes.count ?? 0,
        })
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="header">
        <div className="header-inner">
          <div className="brand">Ausbildung Admin</div>
          <div className="row">
            <button className="btn secondary" onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
      </div>
      <main className="container stack">
        <h1>Dashboard</h1>
        {error && <p className="muted" style={{ color: 'var(--danger)' }}>{error}</p>}
        <div className="grid">
          <div className="card">
            <h3>Total Students (ausbildung_main_engine)</h3>
            <p style={{ fontSize: 28, margin: 0 }}>{stats?.ausbildung_main_engine ?? '—'}</p>
          </div>
          <div className="card">
            <h3>Total Bewerbungen</h3>
            <p style={{ fontSize: 28, margin: 0 }}>{stats?.bewerbungen ?? '—'}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
