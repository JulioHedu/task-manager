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
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        <span style={s.brandDot} />
        Task Manager
      </Link>
      <div style={s.right}>
        {user ? (
          <>
            <Link to="/create" style={s.newBtn}>
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Nueva tarea
            </Link>
            <div style={s.divider} />
            <span style={s.userChip}>
              <span style={s.avatar}>{user.username?.[0]?.toUpperCase()}</span>
              {user.username}
            </span>
            <button onClick={handleLogout} style={s.logoutBtn}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.link}>Iniciar sesión</Link>
            <Link to="/register" style={s.registerBtn}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    height: 60,
    background: '#1a1a2e',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    textDecoration: 'none',
    letterSpacing: '-0.01em',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#6c63ff',
    flexShrink: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0.4rem 0.9rem',
    background: '#6c63ff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'background 150ms ease',
  },
  divider: {
    width: 1,
    height: 20,
    background: 'rgba(255,255,255,0.12)',
    margin: '0 0.25rem',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.75)',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: 'rgba(108,99,255,0.35)',
    color: '#c4c0ff',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '0.35rem 0.8rem',
    borderRadius: 7,
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  link: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  registerBtn: {
    padding: '0.4rem 0.9rem',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};
