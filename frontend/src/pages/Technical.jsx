import { useState, useEffect } from 'react';
import api from '../utils/api';

function Technical() {
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState({});
  const [formData, setFormData] = useState({
    subject: '',
    topics: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, statsRes] = await Promise.all([
        api.get('/technical'),
        api.get('/technical/stats')
      ]);
      setSkills(skillsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch technical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const topics = formData.topics
        .split(',')
        .map(t => t.trim())
        .filter(t => t)
        .map(name => ({ name, completed: false }));

      await api.post('/technical', {
        subject: formData.subject,
        topics
      });
      setShowModal(false);
      setFormData({ subject: '', topics: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to add subject:', error);
    }
  };

  const toggleTopic = async (skillId, topicId) => {
    try {
      await api.patch(`/technical/${skillId}/topics/${topicId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle topic:', error);
    }
  };

  const addTopic = async (skillId) => {
    if (!newTopic[skillId]?.trim()) return;
    try {
      await api.post(`/technical/${skillId}/topics`, { name: newTopic[skillId] });
      setNewTopic({ ...newTopic, [skillId]: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to add topic:', error);
    }
  };

  const deleteTopic = async (skillId, topicId) => {
    try {
      await api.delete(`/technical/${skillId}/topics/${topicId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const deleteSubject = async (skillId) => {
    if (window.confirm('Delete this subject and all its topics?')) {
      try {
        await api.delete(`/technical/${skillId}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete subject:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Technical Skills Tracker</h1>
        <p>Track your technical subject preparation</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="stat-value">{stats?.totalSubjects || 0}</div>
          <div className="stat-label">Subjects</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.completedTopics || 0}</div>
          <div className="stat-label">Topics Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="stat-value">{stats?.totalTopics || 0}</div>
          <div className="stat-label">Total Topics</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-value">{stats?.overallCompletion || 0}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
      </div>

      {/* Add Subject Button */}
      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Subject
        </button>
      </div>

      {/* Subject Cards */}
      {skills.length > 0 ? (
        skills.map((skill) => (
          <div key={skill._id} className="subject-card">
            <div className="subject-header">
              <h3 className="subject-title">{skill.subject}</h3>
              <div className="actions">
                <button 
                  className="icon-btn danger"
                  onClick={() => deleteSubject(skill._id)}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="subject-progress">
              <div className="progress-bar" style={{ flex: 1 }}>
                <div 
                  className="progress green" 
                  style={{ width: `${skill.completionPercentage}%` }}
                ></div>
              </div>
              <span>{skill.completionPercentage}% complete</span>
            </div>

            <div className="topic-list">
              {skill.topics.map((topic) => (
                <div key={topic._id} className={`topic-item ${topic.completed ? 'completed' : ''}`}>
                  <div 
                    className={`checkbox ${topic.completed ? 'checked' : ''}`}
                    onClick={() => toggleTopic(skill._id, topic._id)}
                  >
                    {topic.completed && (
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span style={{ flex: 1 }}>{topic.name}</span>
                  <button 
                    className="icon-btn danger"
                    onClick={() => deleteTopic(skill._id, topic._id)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="add-topic-form">
              <input
                type="text"
                placeholder="Add new topic..."
                value={newTopic[skill._id] || ''}
                onChange={(e) => setNewTopic({ ...newTopic, [skill._id]: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addTopic(skill._id)}
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => addTopic(skill._id)}
              >
                Add
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="card">
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3>No subjects yet</h3>
            <p>Add subjects like DSA, DBMS, OS to start tracking</p>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Subject</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject Name</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">Select subject</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Database Management System">Database Management System</option>
                  <option value="Operating System">Operating System</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Object Oriented Programming">Object Oriented Programming</option>
                  <option value="System Design">System Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Topics (comma-separated)</label>
                <textarea
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="e.g., Arrays, Linked Lists, Trees, Graphs"
                  rows={4}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Technical;
