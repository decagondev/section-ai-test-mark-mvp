import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../services/apiService';

interface Submission {
  _id: string;
  githubUrl: string;
  status: string;
  createdAt: string;
  grade: string;
  report?: string;
  metadata?: any;
  error?: string;
  scores?: {
    total: number;
    breakdown: {
      category: string;
      score: number;
      maxScore: number;
    }[];
  };
}

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string>('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.request(`/api/submissions/${id}`);
        setSubmission(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReportLoading(true);
    setReportError(null);
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/submissions/${id}/report.md`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch report');
        const text = await res.text();
        setReport(text);
      })
      .catch((err) => setReportError(err.message))
      .finally(() => setReportLoading(false));
  }, [id]);

  if (loading) return <div>Loading submission...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>;
  if (!submission) return <div>Submission not found.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Submission Results</h1>
      {submission.error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">Error: {submission.error}</div>
      )}
      <div className="mb-2"><b>Repo:</b> <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{submission.githubUrl}</a></div>
      <div className="mb-2"><b>Status:</b> {submission.status}</div>
      <div className="mb-2"><b>Grade:</b> {submission.grade}</div>
      <div className="mb-2"><b>Created:</b> {new Date(submission.createdAt).toLocaleString()}</div>
      {submission.scores && submission.scores.breakdown && (
        <div className="mb-4 flex flex-col space-y-1">
          {submission.scores.breakdown.map((b: any) => (
            <div key={b.category} className="text-sm">
              <b>{b.category} Score:</b> {b.score} / {b.maxScore}
            </div>
          ))}
        </div>
      )}
      <div className="mb-4">
        <a
          href={`http://localhost:3001/api/submissions/${(submission as any)._id || (submission as any).id}/report.md`}
          className="bg-blue-700 text-white px-3 py-1 rounded font-semibold hover:bg-blue-800 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Report
        </a>
      </div>
      <Link to="/dashboard" className="text-blue-700 underline">Back to Dashboard</Link>
    </div>
  );
}; 