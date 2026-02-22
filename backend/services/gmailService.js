const { google } = require('googleapis');

// Placement-related keywords to filter emails
const PLACEMENT_KEYWORDS = [
  // Application related
  'application', 'applied', 'apply', 'candidate', 'applicant',
  // Interview related
  'interview', 'screening', 'technical round', 'hr round', 'assessment',
  'coding test', 'online test', 'aptitude test', 'hiring challenge',
  // Offer related
  'offer letter', 'job offer', 'selected', 'congratulations', 'welcome aboard',
  // Rejection related
  'regret', 'unfortunately', 'not selected', 'not shortlisted', 'rejected',
  // Company hiring
  'recruitment', 'hiring', 'job opportunity', 'career', 'position',
  'internship', 'full-time', 'placement', 'campus', 'walk-in',
  // Common company names (add more as needed)
  'google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix',
  'infosys', 'tcs', 'wipro', 'cognizant', 'accenture', 'deloitte',
  'goldman sachs', 'morgan stanley', 'jpmorgan', 'uber', 'flipkart',
  // Platforms
  'linkedin', 'naukri', 'indeed', 'glassdoor', 'hackerrank', 'hackerearth',
  'codingninjas', 'leetcode', 'interviewbit'
];

// Email category classification
const CATEGORY_PATTERNS = {
  interview: [
    'interview', 'screening', 'technical round', 'hr round',
    'scheduled', 'meeting invite', 'video call', 'zoom', 'teams meeting'
  ],
  assessment: [
    'assessment', 'test', 'coding challenge', 'online test',
    'aptitude', 'hackerrank', 'hackerearth', 'codility'
  ],
  offer: [
    'offer letter', 'job offer', 'selected', 'congratulations',
    'welcome', 'compensation', 'package', 'joining'
  ],
  rejection: [
    'regret', 'unfortunately', 'not selected', 'not shortlisted',
    'rejected', 'not proceed', 'other candidates'
  ],
  application: [
    'application received', 'application submitted', 'thank you for applying',
    'applied successfully', 'resume received'
  ]
};

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate OAuth URL
  getAuthUrl(userId) {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId,
      prompt: 'consent'
    });
  }

  // Exchange code for tokens
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set credentials
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Refresh access token if needed
  async refreshTokenIfNeeded(user) {
    if (!user.gmail?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const now = new Date();
    const expiry = new Date(user.gmail.tokenExpiry);

    // Refresh if token expires in less than 5 minutes
    if (expiry - now < 5 * 60 * 1000) {
      this.oauth2Client.setCredentials({
        refresh_token: user.gmail.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        accessToken: credentials.access_token,
        tokenExpiry: new Date(credentials.expiry_date)
      };
    }

    return null;
  }

  // Build search query for placement emails
  buildSearchQuery() {
    // Search for emails from last 30 days containing placement keywords
    const keywordGroups = PLACEMENT_KEYWORDS.slice(0, 20); // Limit to prevent query too long
    const query = keywordGroups.map(k => `"${k}"`).join(' OR ');
    return `newer_than:30d (${query})`;
  }

  // Fetch emails from Gmail
  async fetchEmails(accessToken, maxResults = 50) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    // Search for placement-related emails
    const query = this.buildSearchQuery();
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });

    if (!response.data.messages) {
      return [];
    }

    // Fetch full details for each email
    const emails = await Promise.all(
      response.data.messages.map(async (msg) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });
        return this.parseEmail(email.data);
      })
    );

    return emails.filter(email => this.isPlacementRelated(email));
  }

  // Parse email data
  parseEmail(emailData) {
    const headers = emailData.payload.headers;
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Get email body
    let body = '';
    let snippet = emailData.snippet || '';

    if (emailData.payload.body?.data) {
      body = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
    } else if (emailData.payload.parts) {
      const textPart = emailData.payload.parts.find(
        p => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    // Clean HTML if present
    if (body.includes('<')) {
      body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return {
      gmailId: emailData.id,
      threadId: emailData.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: new Date(getHeader('Date')),
      snippet: snippet,
      body: body.substring(0, 5000), // Limit body size
      labels: emailData.labelIds || [],
      isRead: !emailData.labelIds?.includes('UNREAD')
    };
  }

  // Check if email is placement related
  isPlacementRelated(email) {
    const content = `${email.subject} ${email.snippet} ${email.from}`.toLowerCase();
    return PLACEMENT_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
  }

  // Categorize email
  categorizeEmail(email) {
    const content = `${email.subject} ${email.snippet}`.toLowerCase();

    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      if (patterns.some(pattern => content.includes(pattern.toLowerCase()))) {
        return category;
      }
    }

    return 'other';
  }

  // Extract company name from email
  extractCompany(email) {
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
      'Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture', 'Deloitte',
      'Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Uber', 'Flipkart',
      'Zomato', 'Swiggy', 'Paytm', 'Adobe', 'Oracle', 'IBM', 'Intel',
      'Qualcomm', 'Samsung', 'LinkedIn', 'Twitter', 'Salesforce'
    ];

    const content = `${email.subject} ${email.from}`;
    
    for (const company of companies) {
      if (content.toLowerCase().includes(company.toLowerCase())) {
        return company;
      }
    }

    // Try to extract from email domain
    const fromMatch = email.from.match(/@([a-zA-Z0-9]+)\./);
    if (fromMatch) {
      const domain = fromMatch[1];
      // Skip common email providers
      if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'mail'].includes(domain.toLowerCase())) {
        return domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    return null;
  }
}

module.exports = new GmailService();
