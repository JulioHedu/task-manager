import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (!user) return;
    let interval;

    const fetch = () =>
      api.get('/notifications').then((res) => setNotifs(res.data)).catch(() => {});

    const start = () => {
      fetch();
      interval = setInterval(fetch, 30000);
    };
    const stop = () => clearInterval(interval);

    start();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
    return () => { stop(); document.removeEventListener('visibilitychange', start); };
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleToggleNotifs = () => {
    setShowNotifs((prev) => !prev);
    if (!showNotifs && notifs.length > 0) {
      markAllAsRead();
    }
  };

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
            <Link to="/bitacoras" style={s.bitacoraBtn}>
              📋 Bitácoras
            </Link>
            <Link to="/create" style={s.newBtn}>
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Nueva tarea
            </Link>
            <div style={s.divider} />
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button onClick={handleToggleNotifs} style={s.bellBtn}>
                🔔
                {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
              </button>
              {showNotifs && (
                <div style={s.dropdown}>
                  <div style={s.dropdownHeader}>
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} style={s.markAllBtn}>✓ Marcar todas leídas</button>
                    )}
                  </div>
                  {notifs.length === 0 ? (
                    <div style={s.empty}>Sin notificaciones</div>
                  ) : (
                    notifs.map((n) => (
                      <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} style={{ ...s.notifItem, opacity: n.read ? 0.6 : 1, cursor: n.read ? 'default' : 'pointer' }}>
                        <div style={s.notifDot} />
                        <span style={s.notifMsg}>{n.message}</span>
                        <span style={s.notifTime}>
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
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
  bitacoraBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0.4rem 0.9rem',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    borderRadius: 8,
    fontSize: '0.85rem',
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
  bellBtn: {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    background: '#e94560',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    minWidth: 17,
    height: 17,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 320,
    maxHeight: 360,
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    marginTop: 8,
    zIndex: 200,
  },
  dropdownHeader: {
    padding: '0.75rem 1rem',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#1a1a2e',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markAllBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6c63ff',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 6,
  },
  empty: {
    padding: '1.5rem 1rem',
    textAlign: 'center',
    color: '#999',
    fontSize: '0.85rem',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0.7rem 1rem',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '0.85rem',
    color: '#333',
  },
  notifDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#6c63ff',
    flexShrink: 0,
  },
  notifMsg: { flex: 1, lineHeight: 1.3 },
  notifTime: { fontSize: '0.75rem', color: '#999', whiteSpace: 'nowrap', marginLeft: 8 },
};
