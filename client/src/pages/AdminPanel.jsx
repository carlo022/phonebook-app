import { useState, useEffect, useContext } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Loader from '../components/Loader';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'user',
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Ensure you have admin privileges.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- MODAL HANDLERS ---
  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (userToEdit) => {
    setModalMode('edit');
    setEditingId(userToEdit.id);
    setFormData({ 
      firstName: userToEdit.firstName, 
      lastName: userToEdit.lastName, 
      email: userToEdit.email, 
      password: '', 
      role: userToEdit.role 
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isSuperAdmin = currentUser.role === 'super-admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/users', formData);
      } else {
        const payload = { 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          role: formData.role 
        };
        
        // Only append the email to the payload if the user is a Super Admin
        if (isSuperAdmin) {
          payload.email = formData.email;
        }

        await api.put(`/users/${editingId}`, payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process request');
    }
  };

  // --- ACTIONS ---
  const handleApprove = async (id) => {
    try { await api.put(`/users/${id}/approve`); fetchUsers(); } 
    catch (err) { alert(err.response?.data?.message || 'Failed to approve/activate user'); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) return;
    try { await api.put(`/users/${id}`, { isActive: false }); fetchUsers(); } 
    catch (err) { alert('Failed to deactivate user'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanent Action: Are you sure you want to completely delete this user?')) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); } 
    catch (err) { alert(err.response?.data?.message || 'Failed to delete user'); }
  };

  // --- PERMISSION HELPERS ---
  const canManageUser = (targetRole) => {
    if (isSuperAdmin) return true;
    if (currentUser.role === 'admin' && targetRole === 'user') return true;
    return false;
  };

  return (
    <div className="mt-8 pb-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 transition">
          <Plus size={20} /> Add New User
        </button>
      </div>

      {error && <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>}

      {isLoading ? (
        <Loader message="Fetching users..." />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => {
                const hasPermission = canManageUser(u.role);
                const isSelf = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                      {isSelf && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === 'super-admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="rounded flex items-center gap-1 w-max bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span className="rounded flex items-center gap-1 w-max bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <XCircle size={14} /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission && !isSelf && (
                          <button onClick={() => handleOpenEdit(u)} className="rounded p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition" title="Edit User">
                            <Edit size={18} />
                          </button>
                        )}
                        
                        {/* Distinct Approve/Activate Button */}
                        {hasPermission && !isSelf && !u.isActive && (
                          <button onClick={() => handleApprove(u.id)} className="rounded p-2 text-white bg-green-500 hover:bg-green-600 shadow-sm transition" title="Activate User">
                            <UserCheck size={18} />
                          </button>
                        )}
                        
                        {/* Distinct Deactivate Button */}
                        {hasPermission && !isSelf && u.isActive && (
                          <button onClick={() => handleDeactivate(u.id)} className="rounded p-2 text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition" title="Deactivate User">
                            <UserX size={18} />
                          </button>
                        )}

                        {isSuperAdmin && !isSelf && (
                          <button onClick={() => handleDelete(u.id)} className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition" title="Delete User">
                            <Trash2 size={18} />
                          </button>
                        )}
                        {!hasPermission && !isSelf && (
                          <span className="text-xs text-gray-400 italic">No access</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && <div className="p-8 text-center text-gray-500">No users found.</div>}
        </div>
      )}

      {/* --- ADD/EDIT USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Email Field is visible on Add, AND on Edit if Super Admin */}
              {(modalMode === 'add' || isSuperAdmin) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
                </div>
              )}

              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
                </div>
              )}

              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500 bg-white">
                    <option value="user">Standard User</option>
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">{modalMode === 'add' ? 'Create User' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}