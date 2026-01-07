// src/App.jsx
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx'; // 👈 Don't forget .jsx if needed (Vite sometimes requires it)
import MainPage from './MainPage';
import AdminPanel from './AdminPanel';
import Login from './Login';

function App() {
  // Destructure everything you need in ONE place — pro best practice
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        {isAuthenticated ? (
          <>
            {' | '}
            <Link to="/admin">Admin</Link>
            {' | '}
            {/* Now using the destructured logout — clean & efficient */}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            {' | '}
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Optional: Catch-all for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;