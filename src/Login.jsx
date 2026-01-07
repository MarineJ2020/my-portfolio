// src/Login.jsx
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useContext(AuthContext);
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = (data) => {
    if (login(data.username, data.password)) {
      navigate('/admin');
    } else {
      setError('Invalid credentials - try admin / password123');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('username')} placeholder="Username" required style={{ display: 'block', margin: '10px 0', padding: '8px' }} />
        <input {...register('password')} type="password" placeholder="Password" required style={{ display: 'block', margin: '10px 0', padding: '8px' }} />
        <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;