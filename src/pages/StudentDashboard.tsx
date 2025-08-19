import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

interface BewerbungRow {
  id: string
  name?: string | null
  firmenname?: string | null
  bewerbungsdatum?: string | null
  created_at?: string | null
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const [bewerbungen, setBewerbungen] = useState<BewerbungRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      setError('')

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('bewerbungen')
        .select('id, name, firmenname, bewerbungsdatum, created_at', { count: 'exact' })
        .eq('student_user_id', user.id)

      if (searchText.trim().length > 0) {
        const term = searchText.trim().replace('%', '')
        query = query.or(`name.ilike.%${term}%,firmenname.ilike.%${term}%`)
      }

      const { data, error, count } = await query
        .order('bewerbungsdatum', { ascending: false })
        .range(from, to)

      setLoading(false)
      if (error) {
        setError(error.message)
        setBewerbungen([])
        setTotalCount(0)
      } else {
        setBewerbungen(data ?? [])
        setTotalCount(count ?? 0)
        if ((count ?? 0) > 0 && page > Math.ceil((count ?? 0) / pageSize)) {
          setPage(1)
        }
      }
    }
    load()
  }, [user, page, pageSize, searchText])

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

        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <input
                className="input"
                placeholder="Search by title/company"
                value={searchText}
                onChange={(e) => { setPage(1); setSearchText(e.target.value) }}
                style={{ minWidth: 260 }}
              />
            </div>
            <div className="row">
              <button className="btn secondary" onClick={() => { setSearchText(''); setPage(1) }}>Reset</button>
            </div>
          </div>
        </div>

        {error && <p className="muted" style={{ color: 'var(--danger)' }}>{error}</p>}

        {loading ? (
          <div className="card"><p className="muted">Loading…</p></div>
        ) : bewerbungen.length === 0 ? (
          <div className="card">
            <p className="muted">No applications found.</p>
          </div>
        ) : (
          <div className="stack">
            <div className="grid">
              {bewerbungen.map((b) => (
                <div className="card" key={b.id}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong>{b.name ?? 'Application'}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {b.bewerbungsdatum ? new Date(b.bewerbungsdatum).toLocaleDateString() : (b.created_at ? new Date(b.created_at).toLocaleDateString() : '')}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 14 }}>{b.firmenname || ''}</div>
                </div>
              ))}
            </div>

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Page {page} of {totalPages} • {totalCount} total</span>
              <div className="row">
                <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
