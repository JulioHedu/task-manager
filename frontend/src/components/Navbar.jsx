import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Task Manager</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <span style={styles.user}>Hola, {user.username}</span>
            <Link to="/create" style={styles.link}>Nueva Tarea</Link>
            <button onClick={handleLogout} style={styles.btn}>Cerrar Sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
            <Link to="/register" style={styles.link}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#1a1a2e',
    color: '#fff',
  },
  brand: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  user: {
    color: '#e0e0e0',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
  },
  btn: {
    background: '#e94560',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: 4,
    cursor: 'pointer',
  },
};
