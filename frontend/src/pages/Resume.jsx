import { useState, useEffect } from 'react';
import api from '../utils/api';

function Resume() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({ name: '', notes: '' });

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await api.get('/resume');
      setResume(response.data);
    } catch (error) {
      console.error('Failed to fetch resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (sectionId, status, notes) => {
    try {
      await api.patch(`/resume/sections/${sectionId}`, { status, notes });
      fetchResume();
      setEditingSection(null);
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const addSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resume/sections', newSection);
      setShowModal(false);
      setNewSection({ name: '', notes: '' });
      fetchResume();
    } catch (error) {
      console.error('Failed to add section:', error);
    }
  };

  const deleteSection = async (sectionId) => {
    if (window.confirm('Delete this section?')) {
      try {
        await api.delete(`/resume/sections/${sectionId}`);
        fetchResume();
      } catch (error) {
        console.error('Failed to delete section:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--secondary)';
      case 'in-progress': return '#3B82F6';
      default: return 'var(--warning)';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const completedSections = resume?.sections?.filter(s => s.status === 'completed').length || 0;
  const totalSections = resume?.sections?.length || 0;
  const completionPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Resume Preparation</h1>
        <p>Track your resume sections and completion status</p>
      </div>

      {/* Progress Overview */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Resume Completion</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="progress-bar" style={{ flex: 1, height: '12px' }}>
            <div 
              className="progress green" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {completionPercentage}%
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <span>
            <strong style={{ color: 'var(--secondary)' }}>{completedSections}</strong> completed
          </span>
          <span>
            <strong style={{ color: '#3B82F6' }}>
              {resume?.sections?.filter(s => s.status === 'in-progress').length || 0}
            </strong> in progress
          </span>
          <span>
            <strong style={{ color: 'var(--warning)' }}>
              {resume?.sections?.filter(s => s.status === 'pending').length || 0}
            </strong> pending
          </span>
        </div>
      </div>

      {/* Sections Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Resume Sections</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Add Section
        </button>
      </div>

      <div className="list">
        {resume?.sections?.map((section) => (
          <div key={section._id} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div 
                style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: getStatusColor(section.status),
                  marginTop: 6,
                  flexShrink: 0
                }}
              ></div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{section.name}</span>
                  <span className={`badge ${section.status}`}>
                    {section.status === 'in-progress' ? 'In Progress' : 
                     section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                  </span>
                </div>
                
                {section.notes && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {section.notes}
                  </p>
                )}
                
                {editingSection === section._id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className={`btn btn-sm ${section.status === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateSection(section._id, 'pending', section.notes)}
                    >
                      Pending
                    </button>
                    <button 
                      className={`btn btn-sm ${section.status === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateSection(section._id, 'in-progress', section.notes)}
                    >
                      In Progress
                    </button>
                    <button 
                      className={`btn btn-sm ${section.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateSection(section._id, 'completed', section.notes)}
                    >
                      Completed
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingSection(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingSection(section._id)}
                    >
                      Update Status
                    </button>
                    <button 
                      className="icon-btn danger"
                      onClick={() => deleteSection(section._id)}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #EDE9FE 0%, #DBEAFE 100%)' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Resume Tips
        </h3>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <li>Keep your resume to 1-2 pages maximum</li>
          <li>Use action verbs to describe your achievements</li>
          <li>Quantify your accomplishments with numbers where possible</li>
          <li>Tailor your resume for each job application</li>
          <li>Proofread multiple times for spelling and grammar</li>
          <li>Use a clean, professional format with consistent styling</li>
        </ul>
      </div>

      {/* Add Section Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Resume Section</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={addSection}>
              <div className="form-group">
                <label>Section Name</label>
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  placeholder="e.g., Cover Letter, Portfolio"
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={newSection.notes}
                  onChange={(e) => setNewSection({ ...newSection, notes: e.target.value })}
                  placeholder="Any notes for this section"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resume;
