import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuth() as any;
  const [name, setName] = useState(user?.profile?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  if (!user) return <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-8">Not logged in.</div>;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);
    try {
      const updated = await apiService.updateProfile({ name });
      setProfileSuccess('Profile updated!');
      setUser((u: any) => ({ ...u, profile: updated.profile }));
      setEditModalOpen(false);
    } catch (err: any) {
      setProfileError(err.message || 'Profile update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwSuccess(null);
    setPwError(null);
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      setPwLoading(false);
      return;
    }
    try {
      await apiService.changePassword({ oldPassword, newPassword });
      setPwSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwModalOpen(false);
    } catch (err: any) {
      setPwError(err.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-8 relative">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-2 flex items-center">
        <b className="mr-2">Name:</b> {user.profile?.name || ''}
        <button
          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          onClick={() => { setName(user.profile?.name || ''); setEditModalOpen(true); }}
        >
          Edit
        </button>
      </div>
      <div className="mb-2"><b>Email:</b> {user.email}</div>
      <div className="mb-2"><b>Role:</b> {user.role}</div>
      {profileSuccess && <div className="bg-green-100 text-green-700 p-2 mb-2 rounded">{profileSuccess}</div>}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-semibold mb-2">Edit Profile</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-2">
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {profileError && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{profileError}</div>}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setEditModalOpen(false)}
                  disabled={profileLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="mt-8">
        <button
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-semibold hover:bg-blue-200"
          onClick={() => { setPwModalOpen(true); setPwSuccess(null); setPwError(null); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
        >
          Change Password
        </button>
        {pwSuccess && <div className="bg-green-100 text-green-700 p-2 mt-2 rounded">{pwSuccess}</div>}
      </div>
      {pwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-2">
                <label className="block font-medium mb-1">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {pwError && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{pwError}</div>}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setPwModalOpen(false)}
                  disabled={pwLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
                  disabled={pwLoading}
                >
                  {pwLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 