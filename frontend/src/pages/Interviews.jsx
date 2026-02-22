import { useState, useEffect } from 'react';
import api from '../utils/api';

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: '',
    company: '',
    duration: '',
    rating: 3,
    feedback: '',
    strengths: '',
    improvements: '',
    interviewer: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [interviewsRes, statsRes] = await Promise.all([
        api.get('/interview'),
        api.get('/interview/stats')
      ]);
      setInterviews(interviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/interview', {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null
      });
      setShowModal(false);
      setFormData({
        type: '',
        company: '',
        duration: '',
        rating: 3,
        feedback: '',
        strengths: '',
        improvements: '',
        interviewer: ''
      });
      fetchData();
    } catch (error) {
      console.error('Failed to add interview:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this interview record?')) {
      try {
        await api.delete(`/interview/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete interview:', error);
      }
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={star <= rating ? 'filled' : 'empty'}
            fill={star <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && onChange && onChange(star)}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mock Interview Log</h1>
        <p>Track your mock interviews and improvement over time</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.totalInterviews || 0}</div>
          <div className="stat-label">Total Interviews</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.averageRating || 0}</div>
          <div className="stat-label">Average Rating</div>
        </div>

        {stats?.typeDistribution && Object.entries(stats.typeDistribution).slice(0, 2).map(([type, count]) => (
          <div key={type} className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-value">{count}</div>
            <div className="stat-label" style={{ textTransform: 'capitalize' }}>{type}</div>
          </div>
        ))}
      </div>

      {/* Rating Trend */}
      {stats?.ratingHistory?.length > 1 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Rating Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '100px' }}>
            {stats.ratingHistory.slice(-10).map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <div 
                  style={{ 
                    width: '100%', 
                    height: `${(item.rating / 5) * 80}px`,
                    background: `linear-gradient(to top, var(--primary), var(--primary-light))`,
                    borderRadius: '4px 4px 0 0',
                    minHeight: '16px'
                  }}
                ></div>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
                  {new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview List */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>Interview Records</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Add Interview
          </button>
        </div>

        {interviews.length > 0 ? (
          <div className="list">
            {interviews.map((interview) => (
              <div key={interview._id} className="card" style={{ padding: '1.25rem', background: 'var(--background)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {interview.type} Interview
                      </span>
                      {interview.company && (
                        <span className="badge in-progress">{interview.company}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(interview.date).toLocaleDateString('en', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {interview.duration && ` • ${interview.duration} min`}
                      {interview.interviewer && ` • ${interview.interviewer}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {renderStars(interview.rating)}
                    <button 
                      className="icon-btn danger"
                      onClick={() => handleDelete(interview._id)}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {interview.feedback && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Feedback:</span>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{interview.feedback}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {interview.strengths && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500 }}>Strengths:</span>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{interview.strengths}</p>
                    </div>
                  )}
                  {interview.improvements && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 500 }}>To Improve:</span>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{interview.improvements}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3>No interviews yet</h3>
            <p>Start logging your mock interviews</p>
          </div>
        )}
      </div>

      {/* Add Interview Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Mock Interview</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Interview Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="coding">Coding</option>
                  <option value="system-design">System Design</option>
                </select>
              </div>

              <div className="form-group">
                <label>Company (optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google, Amazon"
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes, optional)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Interview duration"
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <div style={{ padding: '0.5rem 0' }}>
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                </div>
              </div>

              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  placeholder="Overall feedback from the interview"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Strengths</label>
                <input
                  type="text"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="What went well?"
                />
              </div>

              <div className="form-group">
                <label>Areas to Improve</label>
                <input
                  type="text"
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  placeholder="What needs improvement?"
                />
              </div>

              <div className="form-group">
                <label>Interviewer (optional)</label>
                <input
                  type="text"
                  value={formData.interviewer}
                  onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                  placeholder="Interviewer name or platform"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interviews;
