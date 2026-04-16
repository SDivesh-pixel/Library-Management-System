import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Members from './pages/Members'
import Transactions from './pages/Transactions'

const PAGES = [
  { id: 'dashboard',    path: '/',             label: 'Dashboard',     icon: '⬡' },
  { id: 'books',        path: '/books',        label: 'Books',         icon: '📚' },
  { id: 'members',      path: '/members',      label: 'Members',       icon: '👤' },
  { id: 'transactions', path: '/transactions', label: 'Transactions',  icon: '📋' },
]

const PAGE_META = {
  '/':             { title: 'Dashboard',      sub: 'Your library at a glance' },
  '/books':        { title: 'Book Catalogue', sub: 'Manage your collection' },
  '/members':      { title: 'Members',        sub: 'Registered library members' },
  '/transactions': { title: 'Transactions',   sub: 'Issue & return books' },
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const meta = PAGE_META[location.pathname] || { title: 'Library', sub: '' }
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-title">Bibliotheca</div>
          <div className="brand-sub">Library System</div>
        </div>
        <nav className="nav">
          <div className="nav-section" style={{ marginTop: 8 }}>Navigation</div>
          {PAGES.map(p => (
            <div key={p.id}
              className={`nav-item ${location.pathname === p.path ? 'active' : ''}`}
              onClick={() => navigate(p.path)}>
              <span className="nav-icon">{p.icon}</span>{p.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip" style={{ marginBottom: 12 }}>
            <div className="user-avatar">{initials}</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>{user?.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="page-title">{meta.title}</div>
            <div className="page-sub">{meta.sub}</div>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/books" element={<PrivateRoute><Layout><Books /></Layout></PrivateRoute>} />
      <Route path="/members" element={<PrivateRoute><Layout><Members /></Layout></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
