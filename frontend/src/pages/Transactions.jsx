import { useEffect, useState } from 'react'
import api from '../api'
import { Modal, Empty, ToastList } from '../components/UI'
import { useToast } from '../hooks/useToast'

const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const isOverdue = due => due && new Date(due) < new Date()

export default function Transactions() {
  const [txns, setTxns] = useState([])
  const [filter, setFilter] = useState('')
  const [issueModal, setIssueModal] = useState(false)
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ loanDays: 14 })
  const [saving, setSaving] = useState(false)
  const { toasts, toast } = useToast()

  const load = (s = '') => api.get(`/transactions${s ? `?status=${s}` : ''}`).then(r => setTxns(r.data)).catch(() => toast('Failed to load', 'error'))

  useEffect(() => {
    load()
    api.get('/books').then(r => setBooks(r.data))
    api.get('/members').then(r => setMembers(r.data))
  }, [])

  const issue = async () => {
    if (!form.bookId || !form.memberId) return toast('Select book and member', 'error')
    setSaving(true)
    try {
      await api.post('/transactions/issue', { bookId: Number(form.bookId), memberId: Number(form.memberId), loanDays: Number(form.loanDays) })
      toast('Book issued!', 'success')
      load(filter); setIssueModal(false)
      api.get('/books').then(r => setBooks(r.data))
    } catch (e) { toast(e.response?.data?.error || e.message, 'error') }
    setSaving(false)
  }

  const returnBook = async t => {
    if (!confirm(`Return "${t.bookTitle}"?`)) return
    try {
      const r = await api.post(`/transactions/${t.id}/return`)
      const fine = r.data.fine
      toast(fine > 0 ? `Returned. Fine: $${fine.toFixed(2)}` : 'Book returned!', fine > 0 ? 'info' : 'success')
      load(filter)
      api.get('/books').then(r => setBooks(r.data))
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error') }
  }

  return (
    <>
      <ToastList toasts={toasts} />
      <div className="search-bar">
        <select className="form-control" style={{ maxWidth: 200 }} value={filter}
          onChange={e => { setFilter(e.target.value); load(e.target.value) }}>
          <option value="">All Transactions</option>
          <option value="ISSUED">Currently Issued</option>
          <option value="RETURNED">Returned</option>
        </select>
        <button className="btn btn-primary" onClick={() => { setForm({ loanDays: 14 }); setIssueModal(true) }}>
          ＋ Issue Book
        </button>
      </div>

      <div className="card">
        {txns.length === 0 ? <Empty icon="📋" text="No transactions found. Issue a book to get started!" /> : (
          <table>
            <thead><tr><th>Book</th><th>Member</th><th>Issued</th><th>Due Date</th><th>Returned</th><th>Fine</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {txns.map(t => {
                const over = t.status === 'ISSUED' && isOverdue(t.dueDate)
                return (
                  <tr key={t.id}>
                    <td><div className="td-title">{t.bookTitle}</div><div className="text-sm text-muted">{t.bookAuthor}</div></td>
                    <td>{t.memberName}</td>
                    <td className="text-sm text-muted">{fmt(t.issuedAt)}</td>
                    <td style={over ? { color: 'var(--red-soft)', fontSize: 13 } : { fontSize: 13, color: 'var(--text-muted)' }}>{fmt(t.dueDate)}</td>
                    <td className="text-sm text-muted">{fmt(t.returnedAt)}</td>
                    <td>{t.fine > 0 ? <span className="badge badge-red">${t.fine.toFixed(2)}</span> : '—'}</td>
                    <td><span className={`badge ${over ? 'badge-red' : t.status === 'ISSUED' ? 'badge-green' : 'badge-gray'}`}>
                      {over ? 'Overdue' : t.status === 'ISSUED' ? 'Issued' : 'Returned'}
                    </span></td>
                    <td>{t.status === 'ISSUED' && <button className="btn btn-success btn-sm" onClick={() => returnBook(t)}>Return</button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {issueModal && (
        <Modal title="Issue a Book" onClose={() => setIssueModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setIssueModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={issue} disabled={saving}>{saving ? 'Issuing…' : 'Issue Book'}</button>
          </>}>
          <div className="form-group">
            <label className="form-label">Select Book *</label>
            <select className="form-control" value={form.bookId || ''} onChange={e => setForm(f => ({ ...f, bookId: e.target.value }))}>
              <option value="">Choose a book…</option>
              {books.filter(b => b.availableCopies > 0).map(b => (
                <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.availableCopies} available)</option>
              ))}
            </select>
            {books.filter(b => b.availableCopies > 0).length === 0 && (
              <div className="form-error">No books available. Add books or wait for returns.</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Select Member *</label>
            <select className="form-control" value={form.memberId || ''} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
              <option value="">Choose a member…</option>
              {members.filter(m => m.isActive).map(m => (
                <option key={m.id} value={m.id}>{m.name} — {m.email}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Loan Period (days)</label>
            <input className="form-control" type="number" min="1" max="90"
              value={form.loanDays} onChange={e => setForm(f => ({ ...f, loanDays: e.target.value }))} />
          </div>
          <div className="info-box">
            ℹ Fine rate: <span style={{ color: 'var(--gold)' }}>$1.00 per overdue day</span>
          </div>
        </Modal>
      )}
    </>
  )
}
