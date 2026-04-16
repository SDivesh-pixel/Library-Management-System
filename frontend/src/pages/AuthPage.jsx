import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
      } else {
        if (!form.username || !form.password || !form.email) {
          setError('All fields are required'); setLoading(false); return
        }
        await register(form)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-title">Bibliotheca</div>
        <div className="auth-sub">Library Management System</div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" placeholder="Enter username"
              value={form.username || ''} onChange={e => set('username', e.target.value)} required />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="Enter email"
                value={form.email || ''} onChange={e => set('email', e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Enter password"
              value={form.password || ''} onChange={e => set('password', e.target.value)} required />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role || 'LIBRARIAN'} onChange={e => set('role', e.target.value)}>
                <option value="LIBRARIAN">Librarian</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>Don't have an account? <span onClick={() => { setMode('register'); setError(''); setForm({}) }}>Register</span></>
          ) : (
            <>Already have an account? <span onClick={() => { setMode('login'); setError(''); setForm({}) }}>Sign In</span></>
          )}
        </div>
      </div>
    </div>
  )
}
