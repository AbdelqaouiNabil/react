import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <main className="container">
      <div className="card">
        <h1>Unauthorized</h1>
        <p className="muted">You do not have permission to view this page.</p>
        <p>
          <Link className="btn secondary" to="/">Go home</Link>
        </p>
      </div>
    </main>
  )
}
