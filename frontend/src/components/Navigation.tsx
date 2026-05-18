import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  isScorePublic: boolean;
}

const Navigation = () => {
  const [isOpen, setIsOpen]                       = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [language, setLanguage]                   = useState('FR');
  const [searchQuery, setSearchQuery]             = useState('');
  const [searchResults, setSearchResults]         = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching]             = useState(false);
  const [showResults, setShowResults]             = useState(false);

  // Notifications
  const [unreadCount, setUnreadCount]             = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications]         = useState<any[]>([]);
  const [notifsLoaded, setNotifsLoaded]           = useState(false);

  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const searchRef          = useRef<HTMLDivElement>(null);
  const profileRef         = useRef<HTMLDivElement>(null);
  const notifRef           = useRef<HTMLDivElement>(null);
  const searchTimeout      = useRef<NodeJS.Timeout | null>(null);
  const pollInterval       = useRef<NodeJS.Timeout | null>(null);

  // ── Polling du compteur non lu (toutes les 30s) ────────────
  useEffect(() => {
    const fetchCount = () => {
      api.get('/notifications/unread-count')
        .then(res => {
          const count = typeof res.data === 'number' ? res.data : res.data?.count || 0;
          setUnreadCount(count);
        })
        .catch(() => {});
    };

    fetchCount();
    pollInterval.current = setInterval(fetchCount, 30000);
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, []);

  // ── Charge les notifs quand on ouvre le dropdown ───────────
  useEffect(() => {
    if (!showNotifDropdown || notifsLoaded) return;
    api.get('/notifications')
      .then(res => {
        setNotifications(res.data);
        setNotifsLoaded(true);
      })
      .catch(() => {});
  }, [showNotifDropdown, notifsLoaded]);

  // ── Ferme les dropdowns au clic extérieur ─────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setShowResults(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Recherche avec debounce ───────────────────────────────
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search/users?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const handleMarkAllRead = async () => {
    await api.post('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkOneRead = async (notifId: string) => {
    await api.post(`/notifications/${notifId}/read`);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'friend_request':  return '👋';
      case 'friend_accepted': return '🤝';
      case 'badge_earned':    return '🏅';
      case 'comment_reply':   return '💬';
      case 'streak_at_risk':  return '🔥';
      default:                return '🔔';
    }
  };

const menuItems = [
  { icon: '📊', label: 'Tableau de bord', path: '/dashboard',   section: 'Principal' },
  { icon: '📚', label: 'Apprendre',        path: '/learn',       section: 'Principal' },
  { icon: '⚔️', label: 'Battles',          path: '/battles',     section: 'Principal' },
  { icon: '🏆', label: 'Classement',       path: '/leaderboard', section: 'Social'    },
];

const sections = ['Principal', 'Social'];

  return (
    <>
      {/* TOP BAR */}
      <nav style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button style={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            <span style={{ ...styles.hamburgerLine, transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ ...styles.hamburgerLine, opacity: isOpen ? 0 : 1 }} />
            <span style={{ ...styles.hamburgerLine, transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
          <Link to="/dashboard" style={styles.logo}>Knoweo</Link>
        </div>

        {/* SEARCH ICON */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} ref={searchRef}>
        <button
            onClick={() => setShowResults(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: radius.full }}
        >
            🔍
        </button>

        {/* Overlay de recherche */}
        {showResults && (
            <div style={{
            position: 'fixed' as const, top: '64px', left: '50%',
            transform: 'translateX(-50%)',
            width: '500px', maxWidth: '90vw',
            backgroundColor: colors.surface, borderRadius: radius.lg,
            boxShadow: shadows.xl, border: `1px solid ${colors.border}`,
            zIndex: 1100, overflow: 'hidden',
            }}>
            {/* Input dans l'overlay */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: '16px', color: colors.textMuted }}>🔍</span>
                <input
                autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontFamily: 'inherit', color: colors.textPrimary, backgroundColor: 'transparent' }}
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                />
                {isSearching && <span style={{ fontSize: '12px' }}>⏳</span>}
                <button onClick={() => { setShowResults(false); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, fontSize: '14px', fontFamily: 'inherit' }}>
                ✕
                </button>
            </div>

            {/* Résultats */}
            {searchQuery.length < 2 ? (
                <div style={{ padding: '20px', textAlign: 'center' as const }}>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                    Tape au moins 2 caractères pour rechercher
                </p>
                </div>
            ) : searchResults.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' as const }}>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Aucun utilisateur trouvé</p>
                </div>
            ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' as const }}>
                <p style={{ fontSize: '11px', color: colors.textMuted, padding: '10px 16px 4px', margin: 0, fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                    {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                </p>
                {searchResults.map(result => (
                    <div key={result.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => { navigate(`/profile/${result.id}`); setShowResults(false); setSearchQuery(''); }}
                    >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0, overflow: 'hidden' }}>
                        {result.avatarUrl
                        ? <img src={`http://localhost:3001${result.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : `${result.firstName[0]}${result.lastName[0]}`}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                        {result.firstName} {result.lastName}
                        {result.isScorePublic && (
                            <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: colors.accentLight, color: colors.accent, padding: '1px 6px', borderRadius: radius.full, fontWeight: '600' }}>Public</span>
                        )}
                        </p>
                    </div>
                    <span style={{ color: colors.textMuted, fontSize: '14px' }}>→</span>
                    </div>
                ))}
                </div>
            )}
            </div>
        )}
        </div>

        <div style={styles.topBarRight}>

          {/* CLOCHE NOTIFICATIONS */}
          <div style={{ position: 'relative' as const }} ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(p => !p)}
              style={{
                position: 'relative' as const,
                width: '36px', height: '36px',
                borderRadius: radius.full,
                border: 'none', background: 'none',
                cursor: 'pointer', fontSize: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute' as const, top: '0px', right: '0px',
                  minWidth: '16px', height: '16px',
                  backgroundColor: '#EF4444', color: 'white',
                  borderRadius: radius.full, fontSize: '10px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px', border: `2px solid ${colors.primary}`,
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN NOTIFICATIONS */}
            {showNotifDropdown && (
              <div style={{
                position: 'absolute' as const, top: 'calc(100% + 10px)', right: 0,
                backgroundColor: colors.surface, borderRadius: radius.lg,
                boxShadow: shadows.xl, border: `1px solid ${colors.border}`,
                width: '340px', maxHeight: '420px', overflowY: 'auto' as const,
                zIndex: 1100,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: `1px solid ${colors.border}` }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: colors.primary, margin: 0 }}>
                    🔔 Notifications
                    {unreadCount > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: 'white', backgroundColor: '#EF4444', padding: '1px 7px', borderRadius: radius.full }}>
                        {unreadCount}
                      </span>
                    )}
                  </p>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                      style={{ fontSize: '11px', color: colors.textMuted, background: 'none', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Tout lire
                    </button>
                  )}
                </div>

                {/* Liste */}
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center' as const }}>
                    <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>🔕</p>
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id}
                      onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 16px', cursor: n.isRead ? 'default' : 'pointer',
                        backgroundColor: n.isRead ? 'transparent' : `${colors.accent}10`,
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{getNotifIcon(n.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: colors.textPrimary, margin: '0 0 3px 0', lineHeight: '1.4' }}>
                          {n.content}
                        </p>
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
                          {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent, flexShrink: 0, marginTop: '4px' }} />
                      )}
                    </div>
                  ))
                )}

                {/* Footer */}
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}` }}>
                  <button
                    onClick={() => { navigate('/profile'); setShowNotifDropdown(false); }}
                    style={{ width: '100%', padding: '8px', backgroundColor: colors.background, border: 'none', borderRadius: radius.md, fontSize: '12px', fontWeight: '600', color: colors.primary, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Voir toutes les notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <div style={styles.langToggle}>
            <button style={{ ...styles.langBtn, ...(language === 'FR' ? styles.langBtnActive : {}) }} onClick={() => setLanguage('FR')}>FR</button>
            <button style={{ ...styles.langBtn, ...(language === 'EN' ? styles.langBtnActive : {}) }} onClick={() => setLanguage('EN')}>EN</button>
          </div>

          {/* PROFILE AVATAR + DROPDOWN */}
          <div style={styles.profileWrapper} ref={profileRef}>
            <button style={styles.avatar} onClick={() => setShowProfileDropdown(!showProfileDropdown)} aria-label="Profil">
              {user?.avatarUrl
                ? <img src={`http://localhost:3001${user.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
            </button>

            {showProfileDropdown && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileDropdownHeader}>
                  <div style={styles.profileDropdownAvatar}>
                    {user?.avatarUrl
                      ? <img src={`http://localhost:3001${user.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
                  </div>
                  <div>
                    <p style={styles.profileDropdownName}>{user?.firstName} {user?.lastName}</p>
                    <p style={styles.profileDropdownEmail}>{user?.email}</p>
                  </div>
                </div>
                <div style={styles.profileDropdownDivider} />
                <Link to="/profile" style={styles.profileDropdownItem} onClick={() => setShowProfileDropdown(false)}>
                  <span>👤</span> Mon profil
                </Link>
                <Link to="/settings" style={styles.profileDropdownItem} onClick={() => setShowProfileDropdown(false)}>
                  <span>⚙️</span> Paramètres
                </Link>
                <div style={styles.profileDropdownDivider} />
                <button style={styles.profileDropdownLogout}
                  onClick={() => { setShowProfileDropdown(false); setShowLogoutConfirm(true); }}>
                  <span>🚪</span> Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
       <div
        style={{ ...styles.sidebarUser, cursor: 'pointer' }}
        onClick={() => { navigate('/profile'); setIsOpen(false); }}
        >
          <div style={styles.sidebarAvatar}>
            {user?.avatarUrl
              ? <img src={`http://localhost:3001${user.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
          </div>
          <div>
            <p style={styles.sidebarUserName}>{user?.firstName} {user?.lastName}</p>
            <p style={styles.sidebarUserEmail}>{user?.email}</p>
          </div>
        </div>

        <div style={styles.menuItems}>
          {sections.map(section => (
            <div key={section} style={styles.menuSection}>
              <p style={styles.sectionLabel}>{section}</p>
              {menuItems.filter(item => item.section === section).map(item => {
                const isActive = location.pathname === item.path;
                const isAmis   = item.path === '/friends';
                return (
                  <Link key={item.path} to={item.path}
                    style={{ ...styles.menuItem, ...(isActive ? styles.menuItemActive : {}) }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span style={styles.menuIcon}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {/* Badge demandes d'amis */}
                    {isAmis && unreadCount > 0 && (
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', backgroundColor: '#EF4444', padding: '1px 6px', borderRadius: radius.full }}>
                        {unreadCount}
                      </span>
                    )}
                    {isActive && <span style={styles.activeIndicator} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <button style={styles.logoutBtn} onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}>
          🚪 Se déconnecter
        </button>
      </div>

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Se déconnecter ?</h2>
            <p style={styles.modalText}>Tu vas être redirigé vers la page de connexion.</p>
            <div style={styles.modalButtons}>
              <button style={styles.modalCancel} onClick={() => setShowLogoutConfirm(false)}>Annuler</button>
              <button style={styles.modalConfirm} onClick={handleLogout}>Se déconnecter</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── STYLES ────────────────────────────────────────────────────────────────────

const styles: { [key: string]: React.CSSProperties } = {
  topBar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: '64px',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 1000,
    boxShadow: shadows.md,
    gap: '16px',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  hamburger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '5px',
    width: '36px',
    height: '36px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: radius.sm,
  },
  hamburgerLine: {
    display: 'block',
    width: '22px',
    height: '2px',
    backgroundColor: 'white',
    borderRadius: '2px',
    transition: 'all 0.3s',
  },
  logo: {
    color: 'white',
    fontWeight: '800',
    fontSize: '20px',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  searchWrapper: {
    flex: 1,
    maxWidth: '500px',
    position: 'relative',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: '0 14px',
    height: '38px',
    gap: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    transition: 'all 0.2s',
  },
  searchIcon: { fontSize: '14px', opacity: 0.6 },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  searchSpinner: { fontSize: '12px' },
  searchClear: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
    lineHeight: 1,
  },
  searchDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0, right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.xl,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    zIndex: 1100,
    maxHeight: '320px',
    overflowY: 'auto',
  },
  searchEmpty: { padding: '20px', textAlign: 'center' },
  searchEmptyText: { color: colors.textMuted, fontSize: '14px', margin: 0 },
  searchResultsLabel: {
    fontSize: '11px',
    color: colors.textMuted,
    padding: '10px 16px 4px',
    margin: 0,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  searchResultAvatar: {
    width: '36px', height: '36px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
    overflow: 'hidden',
  },
  searchResultInfo: { flex: 1, minWidth: 0 },
  searchResultName: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  publicBadge: {
    fontSize: '10px',
    backgroundColor: colors.accentLight,
    color: colors.accent,
    padding: '1px 6px',
    borderRadius: radius.full,
    fontWeight: '600',
  },
  searchResultArrow: { color: colors.textMuted, fontSize: '14px' },
  langToggle: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
    padding: '2px',
    gap: '2px',
  },
  langBtn: {
    padding: '4px 10px',
    borderRadius: radius.full,
    border: 'none',
    background: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  langBtnActive: {
    backgroundColor: 'white',
    color: colors.primary,
  },
  profileWrapper: { position: 'relative' },
  avatar: {
    width: '36px', height: '36px',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s',
    overflow: 'hidden',
    padding: 0,
  },
  profileDropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.xl,
    border: `1px solid ${colors.border}`,
    minWidth: '240px',
    overflow: 'hidden',
    zIndex: 1100,
  },
  profileDropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: colors.background,
  },
  profileDropdownAvatar: {
    width: '40px', height: '40px',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
    overflow: 'hidden',
  },
  profileDropdownName: {
    fontSize: '14px', fontWeight: '700', color: colors.primary, margin: '0 0 2px 0',
  },
  profileDropdownEmail: {
    fontSize: '12px', color: colors.textMuted, margin: 0,
  },
  profileDropdownDivider: {
    height: '1px', backgroundColor: colors.border,
  },
  profileDropdownItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', color: colors.textPrimary,
    textDecoration: 'none', fontSize: '14px', fontWeight: '500',
    transition: 'background 0.15s',
  },
  profileDropdownLogout: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', color: '#EF4444',
    fontSize: '14px', fontWeight: '600',
    background: 'none', border: 'none',
    cursor: 'pointer', width: '100%', textAlign: 'left',
  },
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1001, backdropFilter: 'blur(2px)',
  },
  sidebar: {
    position: 'fixed', top: 0, left: 0,
    width: '280px', height: '100vh',
    backgroundColor: colors.surface,
    zIndex: 1002, boxShadow: shadows.xl,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex', flexDirection: 'column', overflowY: 'auto',
  },
  sidebarUser: {
    padding: '24px 20px',
    backgroundColor: colors.primary,
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  sidebarAvatar: {
    width: '44px', height: '44px',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.primary,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '700', flexShrink: 0, overflow: 'hidden',
  },
  sidebarUserName: { color: 'white', fontWeight: '700', fontSize: '15px', margin: '0 0 2px 0' },
  sidebarUserEmail: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 },
  menuItems: { flex: 1, padding: '8px 12px' },
  menuSection: { marginBottom: '8px' },
  sectionLabel: {
    fontSize: '10px', fontWeight: '700', color: colors.textMuted,
    letterSpacing: '1px', textTransform: 'uppercase',
    padding: '8px 8px 4px 8px', margin: 0,
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 12px', borderRadius: radius.md,
    color: colors.textSecondary, textDecoration: 'none',
    fontSize: '14px', fontWeight: '500',
    transition: 'all 0.15s', position: 'relative', marginBottom: '2px',
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF', color: colors.primary, fontWeight: '700',
  },
  menuIcon: { fontSize: '18px', width: '24px', textAlign: 'center' },
  activeIndicator: {
    position: 'absolute', right: '12px',
    width: '6px', height: '6px',
    borderRadius: radius.full, backgroundColor: colors.accent,
  },
  logoutBtn: {
    margin: '12px', padding: '12px 16px',
    backgroundColor: '#FEF2F2', color: '#EF4444',
    border: 'none', borderRadius: radius.md,
    fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', textAlign: 'left',
  },
  modalOverlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 2000, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: '40px', maxWidth: '380px', width: '90%',
    boxShadow: shadows.xl, textAlign: 'center',
  },
  modalTitle: { fontSize: '22px', fontWeight: '800', color: colors.primary, margin: '0 0 12px 0' },
  modalText: { fontSize: '15px', color: colors.textSecondary, margin: '0 0 32px 0', lineHeight: '1.6' },
  modalButtons: { display: 'flex', gap: '12px' },
  modalCancel: {
    flex: 1, padding: '13px', borderRadius: radius.md,
    border: `2px solid ${colors.border}`, backgroundColor: 'white',
    color: colors.textPrimary, fontSize: '15px', fontWeight: '600', cursor: 'pointer',
  },
  modalConfirm: {
    flex: 1, padding: '13px', borderRadius: radius.md,
    border: 'none', backgroundColor: '#EF4444',
    color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
  },
};

export default Navigation;