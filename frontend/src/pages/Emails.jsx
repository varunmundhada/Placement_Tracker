import { useState, useEffect } from 'react';
import api from '../utils/api';

function Emails() {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check URL params for OAuth result
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      window.history.replaceState({}, '', '/emails');
    }
    if (params.get('error')) {
      alert('Failed to connect Gmail. Please try again.');
      window.history.replaceState({}, '', '/emails');
    }

    checkGmailStatus();
  }, []);

  const checkGmailStatus = async () => {
    try {
      const response = await api.get('/gmail/status');
      setGmailStatus(response.data);
      
      if (response.data.connected) {
        fetchEmails();
        fetchStats();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('category', filter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/gmail?${params}`);
      setEmails(response.data);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/gmail/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const connectGmail = async () => {
    try {
      const response = await api.get('/gmail/auth-url');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Failed to connect Gmail. Please try again.');
    }
  };

  const disconnectGmail = async () => {
    if (window.confirm('Disconnect Gmail? This will remove all synced emails.')) {
      try {
        await api.post('/gmail/disconnect');
        setGmailStatus({ connected: false, email: null });
        setEmails([]);
        setStats(null);
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  };

  const syncEmails = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/gmail/sync');
      alert(response.data.message);
      fetchEmails();
      fetchStats();
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('Failed to sync emails. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const toggleStar = async (emailId) => {
    try {
      await api.patch(`/gmail/${emailId}/star`);
      setEmails(emails.map(e => 
        e._id === emailId ? { ...e, starred: !e.starred } : e
      ));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const updateCategory = async (emailId, category) => {
    try {
      await api.patch(`/gmail/${emailId}/category`, { category });
      setEmails(emails.map(e => 
        e._id === emailId ? { ...e, category } : e
      ));
      fetchStats();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const deleteEmail = async (emailId) => {
    if (window.confirm('Remove this email from tracker?')) {
      try {
        await api.delete(`/gmail/${emailId}`);
        setEmails(emails.filter(e => e._id !== emailId));
        setSelectedEmail(null);
        fetchStats();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  useEffect(() => {
    if (gmailStatus.connected) {
      fetchEmails();
    }
  }, [filter, searchQuery]);

  const getCategoryColor = (category) => {
    const colors = {
      interview: '#3B82F6',
      assessment: '#8B5CF6',
      offer: '#10B981',
      rejection: '#EF4444',
      application: '#F59E0B',
      other: '#6B7280'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      interview: '📅',
      assessment: '📝',
      offer: '🎉',
      rejection: '❌',
      application: '📨',
      other: '📧'
    };
    return icons[category] || '📧';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 86400000) { // Less than 24 hours
      return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return d.toLocaleDateString('en', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not connected view
  if (!gmailStatus.connected) {
    return (
      <div>
        <div className="page-header">
          <h1>Placement Emails</h1>
          <p>Connect your Gmail to automatically track placement-related emails</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ opacity: 0.8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Connect Gmail</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            We'll automatically fetch emails related to job applications, interviews, offers, and more.
            Your data stays private and secure.
          </p>
          <button className="btn btn-primary" onClick={connectGmail} style={{ padding: '1rem 2rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Connect with Google
          </button>
          
          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '0.75rem', textAlign: 'left' }}>
            <h4 style={{ marginBottom: '1rem' }}>What we track:</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: '2' }}>
              <li>Job application confirmations</li>
              <li>Interview invitations and schedules</li>
              <li>Coding assessments and tests</li>
              <li>Offer letters and rejections</li>
              <li>Emails from companies and job platforms</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Connected view
  return (
    <div>
      <div className="page-header">
        <h1>Placement Emails</h1>
        <p>Track all your placement-related emails in one place</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.total || 0}</div>
          <div className="stat-label">Total Emails</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.byCategory?.interview || 0}</div>
          <div className="stat-label">Interviews</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.byCategory?.offer || 0}</div>
          <div className="stat-label">Offers</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.recent || 0}</div>
          <div className="stat-label">This Week</div>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Connected: {gmailStatus.email}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={disconnectGmail}>
              Disconnect
            </button>
          </div>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={syncEmails}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : '🔄 Sync Emails'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'interview', 'assessment', 'offer', 'rejection', 'application'].map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(cat)}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'all' ? 'All' : `${getCategoryIcon(cat)} ${cat}`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            flex: '1',
            minWidth: '200px'
          }}
        />
      </div>

      {/* Email List */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEmail ? '1fr 1fr' : '1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: 0, maxHeight: '600px', overflow: 'auto' }}>
          {emails.length > 0 ? (
            emails.map((email) => (
              <div
                key={email._id}
                onClick={() => setSelectedEmail(email)}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selectedEmail?._id === email._id ? 'var(--background)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedEmail?._id === email._id ? 'var(--background)' : 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(email._id); }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      padding: 0,
                      color: email.starred ? '#F59E0B' : 'var(--border)',
                      fontSize: '1.25rem'
                    }}
                  >
                    {email.starred ? '★' : '☆'}
                  </button>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ 
                        fontWeight: email.isRead ? 400 : 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {email.from.split('<')[0].trim() || email.from}
                      </span>
                      {email.company && (
                        <span className="badge in-progress">{email.company}</span>
                      )}
                    </div>
                    <div style={{ 
                      fontWeight: email.isRead ? 400 : 500,
                      marginBottom: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {email.subject}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {email.snippet}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDate(email.date)}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      background: getCategoryColor(email.category) + '20',
                      color: getCategoryColor(email.category),
                      textTransform: 'capitalize'
                    }}>
                      {email.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3>No emails found</h3>
              <p>Click "Sync Emails" to fetch your placement emails</p>
            </div>
          )}
        </div>

        {/* Email Detail */}
        {selectedEmail && (
          <div className="card" style={{ maxHeight: '600px', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>{selectedEmail.subject}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div><strong>From:</strong> {selectedEmail.from}</div>
                  <div><strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}</div>
                  {selectedEmail.company && <div><strong>Company:</strong> {selectedEmail.company}</div>}
                </div>
              </div>
              <button 
                className="icon-btn"
                onClick={() => setSelectedEmail(null)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <select
                value={selectedEmail.category}
                onChange={(e) => updateCategory(selectedEmail._id, e.target.value)}
                style={{
                  padding: '0.375rem 0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="application">📨 Application</option>
                <option value="interview">📅 Interview</option>
                <option value="assessment">📝 Assessment</option>
                <option value="offer">🎉 Offer</option>
                <option value="rejection">❌ Rejection</option>
                <option value="other">📧 Other</option>
              </select>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => toggleStar(selectedEmail._id)}
              >
                {selectedEmail.starred ? '★ Starred' : '☆ Star'}
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => deleteEmail(selectedEmail._id)}
              >
                Remove
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

            <div style={{ 
              fontSize: '0.9rem', 
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {selectedEmail.body || selectedEmail.snippet}
            </div>
          </div>
        )}
      </div>

      {/* Company Stats */}
      {stats?.byCompany && Object.keys(stats.byCompany).length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Emails by Company</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(stats.byCompany)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([company, count]) => (
                <span
                  key={company}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--background)',
                    borderRadius: '9999px',
                    fontSize: '0.875rem'
                  }}
                >
                  {company} <strong>({count})</strong>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Emails;
