import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const roles = ['student', 'instructor', 'admin'];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'users' | 'submissions'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'student', name: '' });
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);


  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<any | null>(null);


  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<any | null>(null);
  const [subForm, setSubForm] = useState({ status: '', grade: '', error: '' });
  const [subFormLoading, setSubFormLoading] = useState(false);
  const [subFormError, setSubFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiService.getUsers(),
      apiService.getSubmissions()
    ]).then(([users, subs]) => {
      setUsers(users);
      setSubs(subs);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [user]);

  const openCreateUser = () => {
    setEditUser(null);
    setUserForm({ email: '', password: '', role: 'student', name: '' });
    setEditUserModalOpen(true);
    setUserFormError(null);
  };
  const openEditUser = (u: any) => {
    console.log('Editing user:', u);
    setEditUser(u);
    setUserForm({
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      name: (u.profile && u.profile.name) || u.name || ''
    });
    setEditUserModalOpen(true);
    setUserFormError(null);
  };
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError(null);
    try {
      if (editUser) {
        await apiService.updateUser((editUser as any)._id || (editUser as any).id, { role: userForm.role, name: userForm.name });
      } else {
        await apiService.createUser(userForm);
      }
      setEditUserModalOpen(false);
      const users = await apiService.getUsers();
      setUsers(users);
    } catch (err: any) {
      setUserFormError(err.message || 'Failed to save user');
    } finally {
      setUserFormLoading(false);
    }
  };
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    await apiService.deleteUser(id);
    setUsers(await apiService.getUsers());
  };

  const openEditSub = (s: any) => {
    setEditSub(s);
    setSubForm({ status: s.status, grade: s.grade, error: s.error || '' });
    setSubModalOpen(true);
    setSubFormError(null);
  };
  const handleSubFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSubForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSubFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubFormLoading(true);
    setSubFormError(null);
    try {
      await apiService.adminUpdateSubmission(editSub._id, subForm);
      setSubModalOpen(false);
      const subs = await apiService.getSubmissions();
      setSubs(subs);
    } catch (err: any) {
      setSubFormError(err.message || 'Failed to update submission');
    } finally {
      setSubFormLoading(false);
    }
  };
  const handleDeleteSub = async (id: string) => {
    if (!window.confirm('Delete this submission?')) return;
    await apiService.adminDeleteSubmission(id);
    setSubs(await apiService.getSubmissions());
  };

  const handleUserClick = async (userId: string) => {
    try {
      const user = await apiService.request(`/api/users/${userId}`);
      setModalUser(user);
      setUserDetailsModalOpen(true);
    } catch (err) {
      setModalUser({ error: 'Failed to fetch user details' });
      setUserDetailsModalOpen(true);
    }
  };

  const openViewSub = (s: any) => {
    setEditSub(s);
    setSubModalOpen(true);
  };

  if (!user || user.role !== 'admin') {
    return <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mt-8">Admin access required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4 flex space-x-4">
        <button
          className={`px-4 py-2 rounded font-semibold ${tab === 'users' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${tab === 'submissions' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('submissions')}
        >
          Submissions
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>
      ) : tab === 'users' ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Users</h2>
            <button className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800" onClick={openCreateUser}>Add User</button>
          </div>
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={(u as any)._id || (u as any).id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.profile?.name || ''}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 space-x-2">
                    <button className="text-blue-700 underline" onClick={() => openEditUser(u)}>Edit</button>
                    <button className="text-red-700 underline" onClick={() => handleDeleteUser((u as any)._id || (u as any).id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
                <h2 className="text-lg font-semibold mb-2">{editUser ? 'Edit User' : 'Add User'}</h2>
                <form onSubmit={handleUserFormSubmit}>
                  <div className="mb-2">
                    <label className="block font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserFormChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={!!editUser}
                    />
                  </div>
                  {!editUser && (
                    <div className="mb-2">
                      <label className="block font-medium mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleUserFormChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                  )}
                  <div className="mb-2">
                    <label className="block font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userForm.name}
                      onChange={handleUserFormChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-medium mb-1">Role</label>
                    <select
                      name="role"
                      value={userForm.role}
                      onChange={handleUserFormChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {userFormError && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{userFormError}</div>}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={() => setEditUserModalOpen(false)}
                      disabled={userFormLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
                      disabled={userFormLoading}
                    >
                      {userFormLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Submissions</h2>
          </div>
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 text-left">Repo</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Grade</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
                <th className="p-2 text-left">Report</th>
                <th className="p-2 text-left">Score</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={(s as any)._id || (s as any).id} className="border-t">
                  <td className="p-2"><a href={s.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Repo</a></td>
                  <td className="p-2">
                    <button
                      className="text-blue-700 underline hover:text-blue-900"
                      onClick={() => handleUserClick((s as any).userId)}
                      type="button"
                    >
                      {(s as any).userEmail || (s as any).userId}
                    </button>
                  </td>
                  <td className="p-2">{s.status}</td>
                  <td className="p-2">{s.grade}</td>
                  <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="p-2 space-x-2">
                    <a href="#" onClick={() => openViewSub(s)} className="text-blue-700 hover:text-blue-900 inline-flex items-center" aria-label="View">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                    <button className="text-blue-700 hover:text-blue-900 inline-flex items-center" onClick={() => openEditSub(s)} aria-label="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2 2l-6 6m2-2l6-6" /></svg>
                      Edit
                    </button>
                    <button className="text-red-700 hover:text-red-900 inline-flex items-center" onClick={() => handleDeleteSub((s as any)._id || (s as any).id)} aria-label="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Delete
                    </button>
                  </td>
                  <td className="p-2">
                    {(s.status === 'complete' || s.status === 'completed') && (
                      <a
                        href={`http://localhost:3001/api/submissions/${(s as any)._id || (s as any).id}/report.md`}
                        className="text-green-700 hover:text-green-900 inline-flex items-center mr-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Download Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                        Download
                      </a>
                    )}
                  </td>
                  <td className="p-2">{(s.scores && typeof s.scores.total === 'number') ? s.scores.total : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {subModalOpen && editSub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
                <h2 className="text-lg font-semibold mb-2">Submission Details</h2>
                <div className="mb-2"><b>Repo:</b> <a href={editSub.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{editSub.githubUrl}</a></div>
                <div className="mb-2"><b>Status:</b> {editSub.status}</div>
                <div className="mb-2"><b>Grade:</b> {editSub.grade}</div>
                <div className="mb-2"><b>Created:</b> {new Date(editSub.createdAt).toLocaleString()}</div>
                {editSub.scores && editSub.scores.breakdown && editSub.scores.breakdown.length > 0 ? (
                  <div className="mb-4 flex flex-col space-y-1">
                    {editSub.scores.breakdown.map((b: any) => (
                      <div key={b.category} className="text-sm">
                        <b>{b.category} Score:</b> {b.score} / {b.maxScore}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-gray-500 text-sm">No score breakdown available.</div>
                )}
                <div className="mb-4">
                  {(editSub.status === 'complete' || editSub.status === 'completed') && (
                    <a
                      href={`http://localhost:3001/api/submissions/${editSub._id || editSub.id}/report.md`}
                      className="text-green-700 hover:text-green-900 inline-flex items-center mr-2"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download Report"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                      Download Report
                    </a>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => setSubModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {userDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-semibold mb-2">User Details</h2>
            {modalUser ? (
              modalUser.error ? (
                <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{modalUser.error}</div>
              ) : (
                <div>
                  <div className="mb-2"><b>Name:</b> {modalUser.profile?.name || '-'}</div>
                  <div className="mb-2"><b>Email:</b> {modalUser.email}</div>
                  <div className="mb-2"><b>Role:</b> {modalUser.role}</div>
                </div>
              )
            ) : (
              <div>Loading...</div>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setUserDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 