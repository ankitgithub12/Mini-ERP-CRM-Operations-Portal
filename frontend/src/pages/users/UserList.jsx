import { useState, useEffect } from 'react';
import { userService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import { ROLES } from '../../utils/constants';
import { Plus, UserCog, Loader2, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Sales' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll();
      setUsers(res.data.data);
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'Sales' });
    setIsEdit(false);
    setEditId(null);
    setShowPassword(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) return toast.error('Name and Email are required');
    if (!isEdit && !form.password) return toast.error('Password is required');
    
    setSubmitting(true);
    try {
      if (isEdit) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await userService.update(editId, payload);
        toast.success('User updated successfully');
      } else {
        await userService.create(form);
        toast.success('User created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const triggerEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setIsEdit(true);
    setEditId(u.id);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        const res = await userService.delete(id);
        toast.success(res.data?.message || 'User deleted successfully');
        fetchUsers();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const handleGeneratePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~-';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let generatedPassword = '';
    generatedPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    generatedPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    generatedPassword += numbers[Math.floor(Math.random() * numbers.length)];
    generatedPassword += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 0; i < 6; i++) {
      generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    generatedPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setForm({ ...form, password: generatedPassword });
    setShowPassword(true);
    toast.success('Secure password auto-generated!');
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
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No users found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-gray-900">{u.name}</td>
                    <td className="text-gray-500">{u.email}</td>
                    <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                    <td className="text-sm text-gray-500">{formatDateTime(u.created_at)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => triggerEdit(u)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary-600 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={isEdit ? 'Edit User' : 'Add New User'}>
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
            <label className="label">{isEdit ? 'New Password' : 'Password *'}</label>
            {isEdit && (
              <span className="text-[10px] text-gray-400 block mb-1">
                Leave blank to keep the current password
              </span>
            )}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-10"
                placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                Auto-generate Password
              </button>
            </div>
          </div>
          <div>
            <label className="label">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
              {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEdit ? 'Updating...' : 'Creating...'}</>
              ) : (
                isEdit ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
