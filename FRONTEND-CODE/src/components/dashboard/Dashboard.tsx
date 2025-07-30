import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { Link } from 'react-router-dom';

interface Submission {
  _id: string;
  githubUrl: string;
  status: string;
  createdAt: string;
  grade: string;
  report?: string;
  error?: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ githubUrl: '', rubric: '', projectType: 'express', fileGlobs: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<any | null>(null);
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getSubmissions({ userId: user?.id });
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    pollingInterval = setInterval(async () => {
      const data = await apiService.getSubmissions({ userId: user?.id });
      setSubmissions(data);
      if (data.every((s: any) => s.status === 'completed' || s.status === 'failed')) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      }
    }, 30000);
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(null);
    try {
      const payload: any = {
        githubUrl: form.githubUrl,
        projectType: form.projectType,
        fileGlobs: form.fileGlobs ? form.fileGlobs.split(',').map(s => s.trim()) : undefined,
      };
      if (user && (user.role === 'instructor' || user.role === 'admin')) {
        payload.rubric = form.rubric;
      }
      console.log('Submitting payload:', payload);
      await apiService.submitSubmission(payload);
      setSuccess('Submission created!');
      setForm({ githubUrl: '', rubric: '', projectType: 'express', fileGlobs: '' });
      fetchSubmissions();
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    try {
      let userDetails;
      if (user && user.id === userId) {
        userDetails = await apiService.request('/api/auth/me');
      } else {
        userDetails = await apiService.request(`/api/users/${userId}`);
      }
      setModalUser(userDetails);
      setUserModalOpen(true);
    } catch (err) {
      setModalUser({ error: 'Failed to fetch user details' });
      setUserModalOpen(true);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}!</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Submit a New Grading Request</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-2">
          <div className="mb-2">
            <label className="block font-medium mb-1">GitHub Repo URL</label>
            <input
              type="url"
              name="githubUrl"
              value={form.githubUrl}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Project Type</label>
            <select
              name="projectType"
              value={form.projectType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="express">Express</option>
              <option value="react">React</option>
              <option value="fullstack">Fullstack</option>
              <option value="c">C/C++ Project</option>
            </select>
          </div>
          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <div className="mb-2">
              <label className="block font-medium mb-1">Rubric (Markdown)</label>
              <textarea
                name="rubric"
                value={form.rubric}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
          )}
          <div className="mb-2">
            <label className="block font-medium mb-1">File Globs (comma-separated, optional)</label>
            <input
              type="text"
              name="fileGlobs"
              value={form.fileGlobs}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. src/**/*.ts, README.md"
            />
          </div>
          {submitError && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{submitError}</div>}
          {success && <div className="bg-green-100 text-green-700 p-2 mb-2 rounded">{success}</div>}
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <h2 className="text-xl font-semibold mb-2">Your Submissions</h2>
        <button
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
          onClick={fetchSubmissions}
          type="button"
        >
          Refresh
        </button>
      </div>
      {loading ? (
          <div>Loading submissions...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>
        ) : (
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 text-left">Repo</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Grade</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Actions</th>
                <th className="p-2 text-left">User</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={(sub as any)._id || (sub as any).id} className="border-t">
                  <td className="p-2"><a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Repo</a></td>
                  <td className="p-2">{sub.status}</td>
                  <td className="p-2">{sub.grade}</td>
                  <td className="p-2">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td className="p-2">{(sub as any).scores && typeof (sub as any).scores.total === 'number' ? (sub as any).scores.total : '-'}</td>
                  <td className="p-2">
                    <div className="flex flex-col space-y-1">
                      <a href={`/results/${(sub as any)._id || (sub as any).id}`} className="text-blue-700 hover:text-blue-900 inline-flex items-center" aria-label="View">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </a>
                      {((sub as any).status === 'complete' || (sub as any).status === 'completed') && (
                        <a
                          href={`http://localhost:3001/api/submissions/${(sub as any)._id || (sub as any).id}/report.md`}
                          className="text-green-700 hover:text-green-900 inline-flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download Report"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                          Download
                        </a>
                      )}
                      {(sub as any).error && (
                        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">Error: {(sub as any).error}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <button
                      className="text-blue-700 underline hover:text-blue-900"
                      onClick={() => handleUserClick((sub as any).userId)}
                      type="button"
                    >
                      {(sub as any).userEmail || (sub as any).userId}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      {userModalOpen && (
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
                onClick={() => setUserModalOpen(false)}
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