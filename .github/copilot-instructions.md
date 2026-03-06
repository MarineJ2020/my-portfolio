# Copilot Instructions for Portfolio Site

## Architecture Overview

This is a **React + Vite + Firebase** portfolio application with a public-facing main page and a protected admin dashboard. The project uses real-time Firestore data syncing and Cloudinary for media uploads.

### Data Flow
1. **Firebase Initialization** ([src/firebase.js](src/firebase.js)): Exports `auth`, `db`, and `storage` configured via `.env` variables
2. **Authentication** ([src/context/AuthContext.jsx](src/context/AuthContext.jsx)): Firebase Auth context provides `user`, `loading`, `login`, `logout`
3. **Real-time Hooks** ([src/hooks/](src/hooks/)): `usePositions()`, `useSkills()`, `useExampleWork()`, `useSettings()` use Firestore `onSnapshot()` for live updates
4. **Routing** ([src/App.jsx](src/App.jsx)): Public routes (`/`, `/login`) + protected route (`/admin`) with role-based access

### Firestore Schema
- `positions` collection: `{ name, headline, skillIds[], exampleWorkIds[], displayOrder }`
- `skills` collection: `{ name, description, media[], displayOrder }` where media items are `{ type, url }`
- `exampleWork` collection: `{ title, description, thumbnail, url, displayOrder, roleIds[] }`
- `settings` collection: Single doc `global` with `{ name, profilePic, bgColor, footerText, darkBg, lightBg, animEnabled, darkAnimColor, lightAnimColor }`

## Key Patterns

### React Hooks & Real-time Sync
- All data fetching uses Firestore `onSnapshot()` within `useEffect()` to establish live listeners
- Returns unsubscribe function to prevent memory leaks: `useEffect(() => { const unsub = onSnapshot(...); return unsub; }, [])`
- State updates trigger component re-renders automatically (e.g., adding a position immediately reflects in admin panel)
- Collections are automatically sorted by `displayOrder` field (ascending) on fetch; items without `displayOrder` default to 0

### Display Order System
- Both positions and skills use a `displayOrder` numeric field to control display sequence
- Lower numbers appear first (0 is highest priority)
- When creating new items, `displayOrder` defaults to 0 (can be overridden via AdminPanel)
- When editing items, `displayOrder` can be updated independently
- Frontend components automatically reflect ordering without manual sorting logic

### Media Management
- Images/videos upload to **Cloudinary** (not Firebase Storage) via `handleUploadMedia()` in [AdminPanel.jsx](src/AdminPanel.jsx)
- YouTube URLs are parsed by `getYouTubeEmbedUrl()` ([src/utils/youtube.js](src/utils/youtube.js)) to extract video ID
- Media stored in Firestore as array elements: `{ type: 'image'|'video', url }`
- Example work thumbnails uploaded to Cloudinary and stored as single URL in `thumbnail` field

### Drag-and-Drop Reordering
- Positions and skills can be reordered via drag-and-drop in admin panel (kanban style)
- Handlers: `handleDragStartPos()`, `handleDragOverPos()`, `handleDropPos()` swap `displayOrder` values between dragged and dropped items
- Visual feedback: dragged item shown with opacity and blue border
- Works seamlessly with Firestore sync — order updates persist immediately

### Admin Panel Patterns
- Form state (like `newSkillName`) stored in component-level `useState()` before persisting to Firestore
- Edit mode uses `editingSkillId` to distinguish between "Add New" vs "Update Existing" operations
- Skill-to-Position and Work-to-Position assignment uses `arrayUnion()` and `arrayRemove()` for safe concurrent updates
- Example work manager allows setting thumbnail, title, description, URL, and display order

### Display Order System
- Positions, skills, and example work use a `displayOrder` numeric field to control display sequence
- Lower numbers appear first (0 is highest priority)
- Can be set manually via input field or reordered via drag-and-drop
- Collections automatically sorted on fetch in hooks

### Styling & Theming
- Inline CSS with CSS custom properties (e.g., `color: 'var(--primary)'`, `background: 'var(--glass-border)'`)
- [MainPage.jsx](src/MainPage.jsx) implements light/dark theme toggled manually or automatically based on time of day
- Settings from Firestore control background colors and animation properties

## Development Workflows

### Setup
1. Copy `dummyEnv.txt` → `.env` and populate with Firebase credentials
2. `npm install` → install dependencies
3. Configure Cloudinary upload preset as `portfolio_uploads` in your account

### Local Development
- `npm run dev` → Start Vite dev server (usually http://localhost:5173)
- `npm run lint` → Run ESLint (required for CI/CD)
- `npm run build` → Production build (output to `dist/`)
- `npm run preview` → Preview production build locally

### Firebase/Firestore Rules
- Public read access to `positions`, `skills`, `settings` (everyone can view portfolio)
- Write access restricted to authenticated users (admin-only via security rules, not code-enforced)
- Configure rules in Firebase Console to allow authenticated writes only

### Cloudinary Configuration
- Create unsigned upload preset named `portfolio_uploads`
- Upload endpoint: `https://api.cloudinary.com/v1_1/j-portfolio/{image|video}/upload`
- Both image and video uploads use the same form (`FormData` + file + preset)

## Code Conventions

### Component Structure
- Components use `/* eslint-disable react/react-in-jsx-scope */` to suppress strict JSX rules
- All input state uses `useState()` with clear names: `new<Entity><Property>` (e.g., `newSkillName`)
- Edit/delete operations use consistent button patterns with `className="btn btn-primary"` or `btn-ghost`

### Error Handling
- Async operations wrapped in try-catch; errors typically trigger `alert()` or console.error
- No structured error boundary yet; consider implementing for admin panel robustness

### Dependencies to Know
- **react-router-dom**: Handles routing; `<Routes>`, `<Route>`, `<Navigate>` for protection
- **react-hook-form**: Used in [Login.jsx](src/Login.jsx) with `register()`, `handleSubmit()`
- **firebase**: Auth, Firestore, Storage modules
- **@cloudinary/react**: Unused in current code; URL-gen used instead

## Important Integration Points

### Adding New Fields to Settings
1. Update Firestore schema default in `useSettings()` initial state
2. Add input in [AdminPanel.jsx](src/AdminPanel.jsx) site settings section
3. Add `useEffect()` sync to local state when settings load
4. Reference in MainPage or other components via `settings.<field>`

### Adding New Data Collections
1. Create new hook in [src/hooks/](src/hooks/) following `usePositions` pattern (onSnapshot, CRUD functions)
2. Export hook and import in [AdminPanel.jsx](src/AdminPanel.jsx) and/or [MainPage.jsx](src/MainPage.jsx)
3. Add UI in admin panel for CRUD operations

### Linking Skills to Media
- Use `addMediaToSkill(skillId, { type, url })` to append media array element
- Use `removeMediaFromSkill(skillId, mediaItem)` with exact object match (Firestore requires this)
- Media thumbnails displayed as 40×40px boxes with delete button overlay

### Linking Skills & Example Work to Positions
- `assignSkillToPosition()` and `removeSkillFromPosition()` manage skill arrays
- `assignWorkToPosition()` and `removeWorkFromPosition()` manage example work arrays
- Both use Firestore `arrayUnion()`/`arrayRemove()` for atomic updates

### MainPage UI Structure
- **Roles Header**: "Roles that I'm specialized in" — clickable tabs to switch active position
- **Skills Section**: Conditionally displays "Skills for this role" label only if activeSkills exist
- **Example Work Section**: Grid of thumbnail cards (150px default) — conditionally hidden if no work assigned to active role
- **Modals**: Skill modal shows media; Example work modal shows thumbnail, title, description, and "Check it out" button (conditional on URL)

## Common Pitfalls

1. **Forgot to unsubscribe from Firestore listeners** → Memory leaks; always return `unsub` from `useEffect()`
2. **Confusing Cloudinary endpoint for video vs image** → Use correct `resourceType` parameter
3. **Firestore array mutations without arrayUnion/arrayRemove** → May cause concurrent update conflicts
4. **Admin panel form state not synced** → Always include `useEffect(() => { if(data) setLocal(data); }, [data])`
5. **YouTube URL parsing edge cases** → Always validate with `getYouTubeEmbedUrl()` before storing

## File Navigation Quick Reference

| File | Purpose |
|------|---------|
| [src/firebase.js](src/firebase.js) | Firebase app initialization & exports |
| [src/context/AuthContext.jsx](src/context/AuthContext.jsx) | Global auth state (user, login, logout) |
| [src/App.jsx](src/App.jsx) | Main routing & nav layout |
| [src/MainPage.jsx](src/MainPage.jsx) | Public portfolio view with theme toggle |
| [src/AdminPanel.jsx](src/AdminPanel.jsx) | Admin CRUD + Cloudinary uploads |
| [src/Login.jsx](src/Login.jsx) | Email/password login form |
| [src/hooks/usePositions.js](src/hooks/usePositions.js) | Positions CRUD + Firestore listener |
| [src/hooks/useSkills.js](src/hooks/useSkills.js) | Skills CRUD + media + skill-position mapping |
| [src/hooks/useExampleWork.js](src/hooks/useExampleWork.js) | Example work CRUD + work-position mapping |
| [src/hooks/useSettings.js](src/hooks/useSettings.js) | Global settings CRUD |
| [src/utils/youtube.js](src/utils/youtube.js) | YouTube URL parsing utility |
