import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export default function StudentSettings() {
  const { user } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase
        .from('ausbildung_main_engine')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) {
        setFirstName(data.first_name ?? '')
        setLastName(data.last_name ?? '')
      }
    }
    load()
  }, [user])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('ausbildung_main_engine')
      .upsert({ user_id: user.id, first_name: firstName, last_name: lastName })
    setSaving(false)
    setMessage(error ? error.message : 'Saved')
  }

  return (
    <div className="stack">
      <h1>Profile settings</h1>
      <form onSubmit={save} className="form">
        <div className="field">
          <label className="label">First name</label>
          <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Last name</label>
          <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <button className="btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
      {message && <p className="muted">{message}</p>}
    </div>
  )
}


