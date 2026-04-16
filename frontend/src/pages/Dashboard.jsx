import { useEffect, useState } from 'react'
import api from '../api'

const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const isOverdue = due => due && new Date(due) < new Date()

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard'))
  }, [])

  if (error) return <div className="empty-state" style={{ color: 'var(--red-soft)' }}>{error}</div>
  if (!data) return <div className="loader">⟳ Loading…</div>

  const { stats, recentTransactions, genreStats } = data
  const cards = [
    { label: 'Total Books', value: stats.totalBooks, icon: '📚', cls: 'gold' },
    { label: 'Members', value: stats.totalMembers, icon: '👤', cls: 'blue' },
    { label: 'Issued', value: stats.issuedBooks, icon: '📖', cls: 'green' },
    { label: 'Overdue', value: stats.overdueBooks, icon: '⚠️', cls: 'red' },
    { label: 'Available', value: stats.availableBooks, icon: '✅', cls: 'teal' },
    { label: 'Total Fines', value: `$${(stats.totalFines || 0).toFixed(2)}`, icon: '💰', cls: 'purple' },
  ]

  return (
    <>
      <div className="stat-grid">
        {cards.map(c => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <span className="stat-icon">{c.icon}</span>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Transactions</span></div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div style={{ fontSize: 28, opacity: .4 }}>📋</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>No transactions yet</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Book</th><th>Member</th><th>Status</th><th>Due</th></tr>
              </thead>
              <tbody>
                {recentTransactions.map(t => {
                  const over = t.status === 'ISSUED' && isOverdue(t.dueDate)
                  return (
                    <tr key={t.id}>
                      <td className="td-title">{t.bookTitle}</td>
                      <td>{t.memberName}</td>
                      <td>
                        <span className={`badge ${over ? 'badge-red' : t.status === 'ISSUED' ? 'badge-green' : 'badge-gray'}`}>
                          {over ? 'Overdue' : t.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="text-sm text-muted">{fmt(t.dueDate)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Books by Genre</span></div>
          <div style={{ padding: '16px' }}>
            {genreStats.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '30px 0' }}>
                No books added yet
              </div>
            ) : (() => {
              const max = Math.max(...genreStats.map(g => g.count))
              return genreStats.map(g => (
                <div key={g.genre} style={{ marginBottom: 12 }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 13 }}>{g.genre}</span>
                    <span className="text-muted text-sm">{g.count}</span>
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${Math.round((g.count / max) * 100)}%`, height: '100%', background: 'var(--gold)', borderRadius: 4, transition: 'width .6s' }} />
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
