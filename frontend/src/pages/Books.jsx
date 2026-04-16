import { useEffect, useState } from 'react'
import api from '../api'
import { Modal, Empty, Field } from '../components/UI'
import { useToast } from '../hooks/useToast'
import { ToastList } from '../components/UI'

const GENRES = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Dystopian', 'Technology', 'Self-Help', 'History', 'Biography', 'Mystery', 'Fantasy', 'Romance', 'Thriller'].map(g => ({ value: g, label: g }))

export default function Books() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | book
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const { toasts, toast } = useToast()

  const load = (q = '') => api.get(`/books${q ? `?search=${q}` : ''}`).then(r => setBooks(r.data)).catch(() => toast('Failed to load books', 'error'))

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => { setForm({ totalCopies: 1 }); setModal('add') }
  const openEdit = b => { setForm({ ...b }); setModal(b) }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.title || !form.author || !form.isbn) return toast('Title, Author and ISBN are required', 'error')
    setSaving(true)
    try {
      if (modal === 'add') {
        await api.post('/books', form)
        toast('Book added!', 'success')
      } else {
        await api.put(`/books/${modal.id}`, form)
        toast('Book updated!', 'success')
      }
      load(search); close()
    } catch (e) { toast(e.response?.data?.error || e.message, 'error') }
    setSaving(false)
  }

  const del = async b => {
    if (!confirm(`Delete "${b.title}"?`)) return
    try { await api.delete(`/books/${b.id}`); toast('Book deleted', 'info'); load(search) }
    catch (e) { toast(e.response?.data?.error || 'Delete failed', 'error') }
  }

  return (
    <>
      <ToastList toasts={toasts} />
      <div className="search-bar">
        <div className="input-wrap" style={{ maxWidth: 340 }}>
          <span className="input-icon">🔍</span>
          <input placeholder="Search by title, author or ISBN…" value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Book</button>
      </div>

      <div className="card">
        {books.length === 0 ? <Empty icon="📚" text="No books found. Add your first book!" /> : (
          <table>
            <thead>
              <tr><th>Title / Author</th><th>ISBN</th><th>Genre</th><th>Year</th><th>Copies</th><th>Available</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id}>
                  <td><div className="td-title">{b.title}</div><div className="text-sm text-muted">{b.author}</div></td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{b.isbn}</td>
                  <td>{b.genre ? <span className="badge badge-gold">{b.genre}</span> : '—'}</td>
                  <td className="text-muted">{b.publishedYear || '—'}</td>
                  <td>{b.totalCopies}</td>
                  <td><span className={`badge ${b.availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>{b.availableCopies}</span></td>
                  <td><div className="action-row">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(b)}>Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Book' : 'Edit Book'} onClose={close}
          footer={<>
            <button className="btn btn-outline" onClick={close}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Book'}</button>
          </>}>
          <div className="form-row">
            <Field label="Title *" name="title" value={form.title} onChange={set} required />
            <Field label="Author *" name="author" value={form.author} onChange={set} required />
          </div>
          <div className="form-row">
            <Field label="ISBN *" name="isbn" value={form.isbn} onChange={set} required />
            <Field label="Genre" name="genre" value={form.genre} onChange={set} options={GENRES} />
          </div>
          <div className="form-row">
            <Field label="Published Year" name="publishedYear" type="number" value={form.publishedYear} onChange={set} />
            <Field label="Total Copies" name="totalCopies" type="number" value={form.totalCopies} onChange={set} />
          </div>
        </Modal>
      )}
    </>
  )
}
