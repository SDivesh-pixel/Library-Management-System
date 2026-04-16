import { useEffect, useState } from 'react'
import api from '../api'
import { Modal, Empty, Field, ToastList } from '../components/UI'
import { useToast } from '../hooks/useToast'

const MEMBERSHIP = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PREMIUM', label: 'Premium' }
]
const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function Members() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const { toasts, toast } = useToast()

  const load = (q = '') => api.get(`/members${q ? `?search=${q}` : ''}`).then(r => setMembers(r.data)).catch(() => toast('Failed to load members', 'error'))

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const openAdd = () => { setForm({ membershipType: 'STANDARD' }); setModal('add') }
  const openEdit = m => { setForm({ ...m, membershipType: m.membershipType }); setModal(m) }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.name || !form.email) return toast('Name and Email are required', 'error')
    setSaving(true)
    try {
      if (modal === 'add') { await api.post('/members', form); toast('Member added!', 'success') }
      else { await api.put(`/members/${modal.id}`, form); toast('Member updated!', 'success') }
      load(search); close()
    } catch (e) { toast(e.response?.data?.error || e.message, 'error') }
    setSaving(false)
  }

  const deactivate = async m => {
    if (!confirm(`Deactivate "${m.name}"?`)) return
    try { await api.delete(`/members/${m.id}`); toast('Member deactivated', 'info'); load(search) }
    catch (e) { toast(e.response?.data?.error || 'Failed', 'error') }
  }

  return (
    <>
      <ToastList toasts={toasts} />
      <div className="search-bar">
        <div className="input-wrap" style={{ maxWidth: 340 }}>
          <span className="input-icon">🔍</span>
          <input placeholder="Search by name or email…" value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Member</button>
      </div>

      <div className="card">
        {members.length === 0 ? <Empty icon="👤" text="No members found. Register your first member!" /> : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Membership</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td className="td-title">{m.name}</td>
                  <td className="text-muted">{m.email}</td>
                  <td className="text-muted">{m.phone || '—'}</td>
                  <td><span className={`badge ${m.membershipType === 'PREMIUM' ? 'badge-gold' : 'badge-blue'}`}>{m.membershipType}</span></td>
                  <td className="text-sm text-muted">{fmt(m.joinedAt)}</td>
                  <td><span className={`badge ${m.isActive ? 'badge-green' : 'badge-gray'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td><div className="action-row">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Edit</button>
                    {m.isActive && <button className="btn btn-danger btn-sm" onClick={() => deactivate(m)}>Deactivate</button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Member' : 'Edit Member'} onClose={close}
          footer={<>
            <button className="btn btn-outline" onClick={close}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Member'}</button>
          </>}>
          <div className="form-row">
            <Field label="Full Name *" name="name" value={form.name} onChange={set} required />
            <Field label="Email *" name="email" type="email" value={form.email} onChange={set} required />
          </div>
          <div className="form-row">
            <Field label="Phone" name="phone" value={form.phone} onChange={set} />
            <Field label="Membership Type" name="membershipType" value={form.membershipType} onChange={set} options={MEMBERSHIP} />
          </div>
          <Field label="Address" name="address" value={form.address} onChange={set} />
        </Modal>
      )}
    </>
  )
}
