import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const sortFns: Record<string, (a: any, b: any) => number> = {
  user: (a, b) => (a.userId || '').localeCompare(b.userId || ''),
  date: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  status: (a, b) => (a.status || '').localeCompare(b.status || ''),
  grade: (a, b) => (a.grade || '').localeCompare(b.grade || ''),
};

const statusOptions = [
  '', 'pending', 'uploading', 'installing', 'testing', 'reviewing', 'reporting', 'complete', 'completed', 'failed'
];
const gradeOptions = ['', 'pass', 'fail', 'pending'];

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [deepDiveModalOpen, setDeepDiveModalOpen] = useState(false);
  const [deepDiveSubmission, setDeepDiveSubmission] = useState<any | null>(null);
  const [deepDivePrompt, setDeepDivePrompt] = useState('');

  useEffect(() => {
    if (user?.role !== 'instructor') return;
    setLoading(true);
    setError(null);
    apiService.getSubmissions()
      .then(setSubs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredSubs = subs.filter(s => {
    const matchesSearch =
      !search ||
      (s.userId && s.userId.toLowerCase().includes(search.toLowerCase())) ||
      (s.githubUrl && s.githubUrl.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || s.status === statusFilter;
    const matchesGrade = !gradeFilter || s.grade === gradeFilter;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const sortedSubs = [...filteredSubs].sort((a, b) => {
    const fn = sortFns[sortBy] || (() => 0);
    const res = fn(a, b);
    return sortDir === 'asc' ? res : -res;
  });

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  const openDeepDive = (submission: any) => {
    const prompt = `Please provide a detailed code review and improvement plan for this repository:\nGitHub: ${submission.githubUrl}\nHere is the current grading report:\n${submission.report || ''}\nFocus on code smell, maintainability, and actionable suggestions for the student.`;
    setDeepDivePrompt(prompt);
    setDeepDiveSubmission(submission);
    setDeepDiveModalOpen(true);
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(deepDivePrompt);
  };

  if (!user || user.role !== 'instructor') {
    return <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mt-8">Instructor access required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-2 md:space-y-0">
        <div>
          <label className="block text-sm font-medium mb-1">Search (User or Repo)</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-48"
            placeholder="User ID or Repo URL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2 w-32"
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'All'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Grade</label>
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="border rounded px-3 py-2 w-32"
          >
            {gradeOptions.map(opt => <option key={opt} value={opt}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'All'}</option>)}
          </select>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('user')}>User</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('date')}>Date</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('status')}>Status</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('grade')}>Grade</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Report</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubs.map(s => (
              <tr key={(s as any)._id || (s as any).id} className="border-t">
                <td className="p-2">{(s.userEmail || s.userId)}</td>
                <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="p-2">{s.status}</td>
                <td className="p-2">{s.grade}</td>
                <td className="p-2 space-x-2">
                  <a href={`/results/${(s as any)._id || (s as any).id}`} className="text-blue-700 hover:text-blue-900 inline-flex items-center" aria-label="View">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View
                  </a>
                  <button
                    className="bg-purple-700 text-white px-2 py-1 rounded text-xs hover:bg-purple-800"
                    onClick={() => openDeepDive(s)}
                    type="button"
                  >
                    Request Deep Dive
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
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deepDiveModalOpen && deepDiveSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative">
            <h2 className="text-lg font-semibold mb-2">Grok Deep Dive Prompt</h2>
            <div className="mb-2"><b>Repo:</b> <a href={deepDiveSubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{deepDiveSubmission.githubUrl}</a></div>
            <div className="mb-2"><b>Report:</b></div>
            <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto text-xs mb-2">{deepDiveSubmission.report || 'No report available.'}</pre>
            <div className="mb-2">
              <label className="block font-medium mb-1">Prompt for Grok</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-xs"
                rows={6}
                value={deepDivePrompt}
                readOnly
              />
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                className="bg-green-700 text-white px-3 py-1 rounded font-semibold hover:bg-green-800 text-sm"
                onClick={handleCopyPrompt}
                type="button"
              >
                Copy for Grok
              </button>
              <a
                href="https://grok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 text-white px-3 py-1 rounded font-semibold hover:bg-blue-800 text-sm"
              >
                Go to Grok Webchat
              </a>
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                onClick={() => setDeepDiveModalOpen(false)}
                type="button"
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