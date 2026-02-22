import { useState, useEffect } from 'react';
import api from '../utils/api';

function Aptitude() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    topic: '',
    questionsSolved: '',
    correctAnswers: '',
    timeSpent: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        api.get('/aptitude'),
        api.get('/aptitude/stats')
      ]);
      setSessions(sessionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch aptitude data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/aptitude', {
        ...formData,
        questionsSolved: parseInt(formData.questionsSolved),
        correctAnswers: parseInt(formData.correctAnswers),
        timeSpent: parseInt(formData.timeSpent)
      });
      setShowModal(false);
      setFormData({ topic: '', questionsSolved: '', correctAnswers: '', timeSpent: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to add session:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this session?')) {
      try {
        await api.delete(`/aptitude/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Aptitude Tracker</h1>
        <p>Track your aptitude practice sessions and progress</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="stat-value">{stats?.totalSessions || 0}</div>
          <div className="stat-label">Total Sessions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.totalQuestions || 0}</div>
          <div className="stat-label">Questions Solved</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-value">{stats?.averageAccuracy || 0}%</div>
          <div className="stat-label">Average Accuracy</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.totalTime || 0}</div>
          <div className="stat-label">Minutes Practiced</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>Practice Sessions</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Add Session
          </button>
        </div>

        {sessions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Questions</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                  <th>Time (min)</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td>{session.topic}</td>
                    <td>{session.questionsSolved}</td>
                    <td>{session.correctAnswers}</td>
                    <td>
                      <span style={{ 
                        color: session.accuracy >= 70 ? 'var(--secondary)' : 
                               session.accuracy >= 50 ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {session.accuracy}%
                      </span>
                    </td>
                    <td>{session.timeSpent}</td>
                    <td>{new Date(session.date).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="icon-btn danger"
                        onClick={() => handleDelete(session._id)}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3>No sessions yet</h3>
            <p>Start tracking your aptitude practice</p>
          </div>
        )}
      </div>

      {/* Topic Stats */}
      {stats?.topicStats && Object.keys(stats.topicStats).length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Topic-wise Progress</h3>
          <div className="list">
            {Object.entries(stats.topicStats).map(([topic, data]) => (
              <div key={topic} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">{topic}</div>
                  <div className="list-item-subtitle">
                    {data.questions} questions • {data.time} min spent
                  </div>
                </div>
                <span style={{ 
                  fontWeight: 600,
                  color: (data.correct / data.questions * 100) >= 70 ? 'var(--secondary)' : 
                         (data.correct / data.questions * 100) >= 50 ? 'var(--warning)' : 'var(--danger)'
                }}>
                  {data.questions > 0 ? Math.round(data.correct / data.questions * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Practice Session</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                >
                  <option value="">Select topic</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                  <option value="Data Interpretation">Data Interpretation</option>
                  <option value="Puzzles">Puzzles</option>
                  <option value="General Knowledge">General Knowledge</option>
                </select>
              </div>

              <div className="form-group">
                <label>Questions Solved</label>
                <input
                  type="number"
                  min="1"
                  value={formData.questionsSolved}
                  onChange={(e) => setFormData({ ...formData, questionsSolved: e.target.value })}
                  placeholder="Number of questions"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correct Answers</label>
                <input
                  type="number"
                  min="0"
                  max={formData.questionsSolved || 999}
                  value={formData.correctAnswers}
                  onChange={(e) => setFormData({ ...formData, correctAnswers: e.target.value })}
                  placeholder="Number of correct answers"
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Spent (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.timeSpent}
                  onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                  placeholder="Time in minutes"
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes about this session"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aptitude;
