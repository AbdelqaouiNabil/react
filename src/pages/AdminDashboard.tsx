import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [stats, setStats] = useState<{ ausbildung_main_engine: number; bewerbungen: number } | null>(null)
  const [error, setError] = useState('')
  const [byTelegram, setByTelegram] = useState<{ name: string; total: number }[]>([])
  const [telegramError, setTelegramError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      setTelegramError('')
      
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

      // Aggregate Bewerbungen per telegram_name (client-side)
      const tgRes = await supabase
        .from('bewerbungen')
        .select('telegram_name, id')
        .limit(10000)

      if (!tgRes.error && tgRes.data) {
        console.log('Telegram data loaded:', tgRes.data.length, 'rows')
        const counts = new Map<string, number>()
        for (const row of tgRes.data as Array<{ telegram_name: string | null }>) {
          const key = row.telegram_name ?? '(none)'
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        const arr = Array.from(counts.entries())
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 20)
        setByTelegram(arr)
        console.log('Aggregated telegram counts:', arr)
      } else {
        console.error('Failed to load telegram data:', tgRes.error)
        setTelegramError(tgRes.error?.message || 'Failed to load telegram data')
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
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Bewerbungen by telegram_name</h3>
            {telegramError && <p className="muted" style={{ color: 'var(--danger)' }}>{telegramError}</p>}
            {byTelegram.length === 0 ? (
              <p className="muted">No data</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {byTelegram.map((r) => (
                  <li key={r.name} className="row" style={{ justifyContent: 'space-between' }}>
                    <span>{r.name}</span>
                    <span className="muted">{r.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
