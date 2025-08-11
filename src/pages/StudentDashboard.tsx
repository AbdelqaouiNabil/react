import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

interface BewerbungRow { id: string; title?: string | null; created_at?: string | null }

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const [bewerbungen, setBewerbungen] = useState<BewerbungRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setError('')
      const { data, error } = await supabase
        .from('bewerbungen')
        .select('id, title, created_at')
        .eq('student_user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      else setBewerbungen(data ?? [])
    }
    load()
  }, [user])

  return (
    <div>
      <div className="header">
        <div className="header-inner">
          <div className="brand">Ausbildung</div>
          <div className="row">
            <button className="btn secondary" onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
      </div>
      <main className="container stack">
        <h1>My Bewerbungen</h1>
        {error && <p className="muted" style={{ color: 'var(--danger)' }}>{error}</p>}
        {bewerbungen.length === 0 ? (
          <div className="card">
            <p className="muted">No applications yet.</p>
          </div>
        ) : (
          <div className="grid">
            {bewerbungen.map((b) => (
              <div className="card" key={b.id}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{b.title ?? 'Application'}</strong>
                  <span className="muted" style={{ fontSize: 12 }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
