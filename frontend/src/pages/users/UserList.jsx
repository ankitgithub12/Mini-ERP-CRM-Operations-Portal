import { useState, useEffect } from 'react';
import { userService } from '../../services/dashboardService';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import { ROLES } from '../../utils/constants';
import { Plus, UserCog, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Sales' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll();
      setUsers(res.data.data);
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields are required');
    setSubmitting(true);
    try {
      await userService.create(form);
      toast.success('User created');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'Sales' });
      fetchUsers();
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  const getRoleBadge = (role) => {
    const colors = { Admin: 'badge-purple', Sales: 'badge-info', Warehouse: 'badge-warning', Accounts: 'badge-success' };
    return colors[role] || 'badge-gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and roles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add User</button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No users found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-gray-900">{u.name}</td>
                    <td className="text-gray-500">{u.email}</td>
                    <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                    <td className="text-sm text-gray-500">{formatDateTime(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Enter name" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="Enter email" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Enter password" />
          </div>
          <div>
            <label className="label">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
              {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={submitting} className="btn-primary">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
