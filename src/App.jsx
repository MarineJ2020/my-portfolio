/* eslint-disable react/react-in-jsx-scope */
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import MainPage from './MainPage';
import AdminPanel from './AdminPanel';
import Login from './Login';

function App() {
  const { user, loading, logout } = useContext(AuthContext); //

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>Loading...</div>;
  }

  return (
    <div className="app">
      <nav>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', marginLeft: 0 }}>Portfolio</Link>
        </div>
        <div>
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/admin">Dashboard</Link>
              <button onClick={logout} className="btn btn-ghost" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={user ? <AdminPanel /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;