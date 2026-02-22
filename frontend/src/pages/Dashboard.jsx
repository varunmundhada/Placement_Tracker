import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const { overview, recentActivity } = data || {};

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track your placement preparation progress</p>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Overall Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="progress-bar" style={{ flex: 1, height: '12px' }}>
            <div 
              className="progress purple" 
              style={{ width: `${overview?.overallProgress || 0}%` }}
            ></div>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {overview?.overallProgress || 0}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Link to="/aptitude" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-value">{overview?.aptitude?.accuracy || 0}%</div>
            <div className="stat-label">Aptitude Accuracy</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {overview?.aptitude?.questions || 0} questions solved
            </div>
          </div>
        </Link>

        <Link to="/technical" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div className="stat-value">{overview?.technical?.completion || 0}%</div>
            <div className="stat-label">Technical Skills</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {overview?.technical?.completedTopics || 0}/{overview?.technical?.totalTopics || 0} topics
            </div>
          </div>
        </Link>

        <Link to="/resume" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="stat-value">{overview?.resume?.completion || 0}%</div>
            <div className="stat-label">Resume Ready</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {overview?.resume?.sections || 0} sections
            </div>
          </div>
        </Link>

        <Link to="/interviews" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon orange">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-value">{overview?.interviews?.averageRating || 0}</div>
            <div className="stat-label">Avg Interview Rating</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {overview?.interviews?.total || 0} mock interviews
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>Recent Aptitude Sessions</h3>
            <Link to="/aptitude" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {recentActivity?.aptitude?.length > 0 ? (
            <div className="list">
              {recentActivity.aptitude.map((session) => (
                <div key={session._id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">{session.topic}</div>
                    <div className="list-item-subtitle">
                      {session.questionsSolved} questions • {session.accuracy}% accuracy
                    </div>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent sessions</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Mock Interviews</h3>
            <Link to="/interviews" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {recentActivity?.interviews?.length > 0 ? (
            <div className="list">
              {recentActivity.interviews.map((interview) => (
                <div key={interview._id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ textTransform: 'capitalize' }}>
                      {interview.type} Interview
                    </div>
                    <div className="list-item-subtitle">
                      Rating: {'★'.repeat(interview.rating)}{'☆'.repeat(5 - interview.rating)}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(interview.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent interviews</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
