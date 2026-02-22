# PlaceMate - Smart Placement Preparation Tracker

A modern, responsive web application to help students track and manage their placement preparation in an organized way.

![PlaceMate](https://img.shields.io/badge/PlaceMate-v1.0.0-blue)

## Features

### User Authentication
- Sign up / Login system
- Secure JWT-based session handling

### Dashboard
- Overview of overall preparation progress
- Visual progress indicators
- Summary of completed and pending tasks
- Recent activity feed

### Aptitude Tracker
- Add practice sessions
- Track number of questions solved
- Track accuracy and time spent
- Display progress statistics by topic

### Technical Skills Tracker
- Add subjects (DSA, DBMS, OS, CN, etc.)
- Add topics under each subject
- Mark topics as completed
- Show completion percentage per subject

### Resume Preparation Section
- Checklist for resume sections
- Status tracking (Pending / In Progress / Completed)
- Add custom sections
- Resume tips and guidelines

### Mock Interview Log
- Add mock interview records
- Store feedback, rating, strengths, and improvements
- Show rating trend over time
- Track interviews by type

### Gmail Integration (Placement Emails)
- Connect your Gmail account via OAuth
- Automatically fetch placement-related emails
- Smart categorization (Interview, Offer, Rejection, Assessment, Application)
- Filter and search emails
- Star important emails
- Track emails by company

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Gmail API**: Google OAuth 2.0
- **Styling**: Custom CSS (no frameworks)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
cd "Placement tracker"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already created with defaults)
# Edit .env to update MongoDB URI if needed:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/placemate
# JWT_SECRET=your_secret_key_here

# Start the backend server
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Gmail Integration Setup (Optional)

To enable Gmail integration for tracking placement emails:

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

#### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - App name: PlaceMate
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add your email as a test user (while in testing mode)

#### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: PlaceMate
5. Authorized redirect URIs: `http://localhost:5000/api/gmail/callback`
6. Copy the Client ID and Client Secret

#### Step 4: Update Environment Variables
Edit `backend/.env` and add your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback
FRONTEND_URL=http://localhost:3000
```

#### Step 5: Connect Gmail in the App
1. Go to http://localhost:3000/emails
2. Click "Connect with Google"
3. Sign in and authorize the app
4. Click "Sync Emails" to fetch placement-related emails

## Project Structure

```
Placement tracker/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── AptitudeSession.js
│   │   ├── TechnicalSkill.js
│   │   ├── Resume.js
│   │   └── MockInterview.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── aptitude.js
│   │   ├── technical.js
│   │   ├── resume.js
│   │   ├── interview.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Aptitude.jsx
│   │   │   ├── Technical.jsx
│   │   │   ├── Resume.jsx
│   │   │   └── Interviews.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard` - Get dashboard overview

### Aptitude
- `GET /api/aptitude` - Get all sessions
- `GET /api/aptitude/stats` - Get statistics
- `POST /api/aptitude` - Add session
- `PUT /api/aptitude/:id` - Update session
- `DELETE /api/aptitude/:id` - Delete session

### Technical Skills
- `GET /api/technical` - Get all subjects
- `GET /api/technical/stats` - Get statistics
- `POST /api/technical` - Add subject
- `POST /api/technical/:id/topics` - Add topic
- `PATCH /api/technical/:id/topics/:topicId` - Toggle topic
- `DELETE /api/technical/:id/topics/:topicId` - Delete topic
- `DELETE /api/technical/:id` - Delete subject

### Resume
- `GET /api/resume` - Get resume sections
- `POST /api/resume/sections` - Add section
- `PATCH /api/resume/sections/:sectionId` - Update section
- `DELETE /api/resume/sections/:sectionId` - Delete section

### Mock Interviews
- `GET /api/interview` - Get all interviews
- `GET /api/interview/stats` - Get statistics
- `POST /api/interview` - Add interview
- `PUT /api/interview/:id` - Update interview
- `DELETE /api/interview/:id` - Delete interview

## UI Features

- Clean and minimal design
- Sidebar navigation
- Responsive layout (mobile + desktop)
- Progress bars and visual indicators
- Modal dialogs for forms
- Toast-style feedback
- Dark/Light color scheme ready

## Screenshots

### Dashboard
- Overview cards with key metrics
- Progress indicators
- Recent activity sections

### Aptitude Tracker
- Session list with accuracy tracking
- Topic-wise statistics
- Add session modal

### Technical Skills
- Subject cards with progress bars
- Topic checkboxes
- Inline topic addition

### Resume Preparation
- Section checklist
- Status badges
- Tips section

### Mock Interviews
- Interview cards with ratings
- Rating trend chart
- Detailed feedback display

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Export data to PDF/CSV
- [ ] Study reminders/notifications
- [ ] Goals and targets setting
- [ ] Social sharing of progress
- [ ] Interview question bank
- [ ] Video mock interview integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for placement aspirants
