import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function StudentShell() {
  const { signOut } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">Ausbildung</div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/student" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Bewerbungen
          </NavLink>
          <div className="spacer" />
          <NavLink to="/student/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Profile settings
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="btn secondary" onClick={() => signOut()}>Sign out</button>
        </div>
      </aside>
      <main className="shell-main">
        <div className="container stack">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


