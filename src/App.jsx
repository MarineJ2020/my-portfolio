/* eslint-disable react/react-in-jsx-scope */
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import MainPage from './MainPage';
import AdminPanel from './AdminPanel';
import Login from './Login';

function App() {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            {' | '}
            <Link to="/admin">Admin</Link>
            {' | '}
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
              Logout
            </button>
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