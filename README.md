# My Portfolio (2026)

A modern, full-stack personal portfolio built with React + Vite + Firebase. Features position-based skill showcase with media popups, secure admin panel, real-time data sync, and cloud file uploads.

**Live Site**: https://your-project-id.web.app  
**Admin Login**: Use the email/password you created in Firebase Auth (admin-only access)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Inline/Tailwind-ready (future upgrade planned)
- **Routing**: React Router DOM
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firebase Firestore (real-time sync)
- **File Storage**: Firebase Storage (images/videos)
- **Hosting**: Firebase Hosting
- **State Management**: React hooks + Firebase real-time listeners

## Features

- Responsive main page with profile photo and name
- Position tabs with auto-grid skill cards
- Clickable skill cards → modal popup with media grid (images/videos) and description
- Protected admin panel (/admin) for CRUD:
  - Manage positions
  - Manage skills (name, description, media)
  - Assign skills to positions
  - Real file uploads to Firebase Storage
- Secure auth: Only authenticated admin can edit data
- Production-ready: Fully deployed on Firebase with public reads

## Project Structure
src/
├── components/           # Reusable components (future)
├── context/
│   └── AuthContext.jsx   # Firebase Auth state management
├── firebase.js           # Firebase app initialization & exports (auth, db, storage)
├── hooks/
│   ├── usePositions.js   # Firestore hooks for positions
│   └── useSkills.js      # Firestore hooks for skills + media assignment
├── App.jsx               # Routing & nav (protected routes)
├── main.jsx              # Entry point (ReactDOM + providers)
├── MainPage.jsx          # Public portfolio view
├── AdminPanel.jsx        # Admin CRUD interface with uploads
├── Login.jsx             # Login form
└── index.html            # Vite template



