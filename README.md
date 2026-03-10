# My Portfolio (2026)

A modern, full-stack personal portfolio built with **React + Vite + Firebase**. This project includes:

- Role-based skill management with drag-drop ordering
- Example work gallery with thumbnails, links, and modal previews
- Animated hero + scroll reveal, plus a customizable particle background
- Secure admin dashboard (Firebase auth + Firestore) with real-time syncing
- Cloudinary-based media uploads (images/videos)

---

## 🚀 Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Copy `dummyEnv.txt` → `.env` and fill in your Firebase config values.

### 3) Run locally
```bash
npm run dev
```

### 4) Visit
- Public: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`

---

## 🧰 Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Styling**: CSS variables + inline styles
- **Auth**: Firebase Authentication (Email/Password)
- **Database**: Firebase Firestore (real-time listeners)
- **Media Uploads**: Cloudinary (unsigned preset)
- **Hosting**: Firebase Hosting

---

## 📦 Project Structure

```
src/
├── App.jsx              # Router + protected route logic
├── MainPage.jsx         # Public portfolio view (tabs + modals + scroll animations)
├── AdminPanel.jsx       # Admin CRUD UI (positions, skills, work, settings)
├── Login.jsx            # Auth UI (email/password)
├── ParticleBackground.jsx # Canvas particle system + scroll FOV
├── firebase.js          # Firebase init (auth, firestore, storage)
├── context/
│   └── AuthContext.jsx  # Auth provider / login / logout
├── hooks/
│   ├── usePositions.js  # Positions data + ordering
│   ├── useSkills.js     # Skills + media uploads + assignment
│   ├── useExampleWork.js# Example work CRUD + linking
│   └── useSettings.js   # Global settings (theme, background, footer)
├── utils/
│   └── youtube.js       # YouTube URL parsing helper
└── index.css            # Global styles + animations
```

---

## 🔎 Firestore Schema

### `settings/global` (single document)

| Field | Type | Notes |
|------|------|-------|
| `name` | string | Display name in header |
| `profilePic` | string | URL for profile image |
| `fontSizeHead`, `fontSizeBody` | number | Adjustable font sizes |
| `tagline` | string | Subheading text |
| `lightBg`, `darkBg` | string (hex) | Background colors |
| `animEnabled` | boolean | Enable/disable particle canvas |
| `lightAnimColor`, `darkAnimColor` | string | Particle color overrides |
| `footerLinks` | array | `[{text,url}]` array for footer links |
| ... | ... | background/particle tuning (density, speed, etc.) |

### `positions` (collection)

Each document:
- `name` (string)
- `headline` (string)
- `skillIds` (array of skill doc IDs)
- `exampleWorkIds` (array of work doc IDs)
- `displayOrder` (number)

### `skills` (collection)

Each document:
- `name` (string)
- `description` (string)
- `media` (array of `{ type: 'image'|'video', url }`)
- `displayOrder` (number)

### `exampleWork` (collection)

Each document:
- `title` (string)
- `description` (string)
- `thumbnail` (string URL)
- `url` (string)
- `displayOrder` (number)
- `roleIds` (array of position IDs)

---

## 🧠 Key Patterns

### ✅ Real-time syncing
All UI data flows from Firestore using `onSnapshot()` inside custom hooks. That means updates in the admin dashboard show up instantly in the public UI.

### ✅ Display order
`displayOrder` is used consistently across positions, skills, and example work to control ordering. Lower numbers appear first.

### ✅ Scroll-driven UX
- The hero section animates the profile photo and name into place as you scroll.
- The rest of the page uses scroll-reveal (`IntersectionObserver`) to animate sections in/out.
- The particle canvas scales slightly to create an FOV-like zoom effect.

### ✅ Modals & scroll locking
Skill and work modals lock body scrolling when open (`document.body.style.overflow = 'hidden'`).

---

## 🛠 Admin Dashboard (./admin)

Protected by Firebase Auth.

### What you can manage
- Positions (roles)
- Skills (media + descriptions)
- Example Work (thumbnails, links, descriptions)
- Site settings (theme colors, background animations, footer links)

### Uploads
Uploads use Cloudinary unsigned presets. The admin UI saves returned URLs into Firestore.

---

## 🧩 Extending the App

### Add a new setting
1. Add a default to `useSettings.js` state.
2. Add local state + sync in `AdminPanel.jsx` (`useEffect` + `handleSaveGlobalSettings`).
3. Use it in `MainPage.jsx` or other components.

### Add a new data type
1. Create a `useX` hook (pattern: `usePositions.js`).
2. Add CRUD UI in `AdminPanel.jsx`.
3. Render it in `MainPage.jsx`.

---

## ✅ Useful Commands

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## ☁️ Deployment (Firebase)

```bash
firebase login
npm run build
firebase deploy
```

---

## 🤝 Need a feature?
Anywhere you think it'd be nice to have a new behavior (animations, sections, new data types, or UI improvements), just say the feature and I’ll suggest exactly where to hook it in.



