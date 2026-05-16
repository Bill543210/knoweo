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
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [language, setLanguage] = useState('FR');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search with debounce
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

  const menuItems = [
    { icon: '📊', label: 'Tableau de bord', path: '/dashboard', section: 'Principal' },
    { icon: '📚', label: 'Apprendre', path: '/learn', section: 'Principal' },
    { icon: '⚔️', label: 'Battles', path: '/battles', section: 'Principal' },
    { icon: '👥', label: 'Amis', path: '/friends', section: 'Social' },
    { icon: '🏆', label: 'Classements', path: '/leaderboard', section: 'Social' },
    { icon: '👤', label: 'Mon profil', path: '/profile', section: 'Compte' },
    { icon: '⚙️', label: 'Paramètres', path: '/settings', section: 'Compte' },
    { icon: 'ℹ️', label: 'À propos', path: '/about', section: 'Compte' },
  ];

  const sections = ['Principal', 'Social', 'Compte'];

  return (
    <>
      {/* TOP BAR */}
      <nav style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button
            style={styles.hamburger}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <span style={{ ...styles.hamburgerLine, transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ ...styles.hamburgerLine, opacity: isOpen ? 0 : 1 }} />
            <span style={{ ...styles.hamburgerLine, transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
          <Link to="/dashboard" style={styles.logo}>Knoweo</Link>
        </div>

        {/* SEARCH BAR */}
        <div style={styles.searchWrapper} ref={searchRef}>
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {isSearching && <span style={styles.searchSpinner}>⏳</span>}
            {searchQuery && (
              <button style={styles.searchClear} onClick={() => { setSearchQuery(''); setShowResults(false); }}>✕</button>
            )}
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showResults && (
            <div style={styles.searchDropdown}>
              {searchResults.length === 0 ? (
                <div style={styles.searchEmpty}>
                  <p style={styles.searchEmptyText}>Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <>
                  <p style={styles.searchResultsLabel}>{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}</p>
                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      style={styles.searchResult}
                      onClick={() => {
                        navigate(`/profile/${result.id}`);
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                    >
                      <div style={styles.searchResultAvatar}>
                        {result.firstName[0]}{result.lastName[0]}
                      </div>
                      <div style={styles.searchResultInfo}>
                        <p style={styles.searchResultName}>
                          {result.firstName} {result.lastName}
                          {result.isScorePublic && (
                            <span style={styles.publicBadge}>Public</span>
                          )}
                        </p>
                      </div>
                      <span style={styles.searchResultArrow}>→</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div style={styles.topBarRight}>
          {/* Language Toggle */}
          <div style={styles.langToggle}>
            <button
              style={{ ...styles.langBtn, ...(language === 'FR' ? styles.langBtnActive : {}) }}
              onClick={() => setLanguage('FR')}
            >FR</button>
            <button
              style={{ ...styles.langBtn, ...(language === 'EN' ? styles.langBtnActive : {}) }}
              onClick={() => setLanguage('EN')}
            >EN</button>
          </div>

          {/* PROFILE AVATAR + DROPDOWN */}
          <div style={styles.profileWrapper} ref={profileRef}>
            <button
              style={styles.avatar}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-label="Profil"
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </button>

            {showProfileDropdown && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileDropdownHeader}>
                  <div style={styles.profileDropdownAvatar}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p style={styles.profileDropdownName}>{user?.firstName} {user?.lastName}</p>
                    <p style={styles.profileDropdownEmail}>{user?.email}</p>
                  </div>
                </div>
                <div style={styles.profileDropdownDivider} />
                <Link
                  to="/profile"
                  style={styles.profileDropdownItem}
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <span>👤</span> Mon profil
                </Link>
                <Link
                  to="/settings"
                  style={styles.profileDropdownItem}
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <span>⚙️</span> Paramètres
                </Link>
                <div style={styles.profileDropdownDivider} />
                <button
                  style={styles.profileDropdownLogout}
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowLogoutConfirm(true);
                  }}
                >
                  <span>🚪</span> Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div style={styles.sidebarUser}>
          <div style={styles.sidebarAvatar}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
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
              {menuItems
                .filter(item => item.section === section)
                .map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...styles.menuItem,
                      ...(location.pathname === item.path ? styles.menuItemActive : {}),
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span style={styles.menuIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                    {location.pathname === item.path && (
                      <span style={styles.activeIndicator} />
                    )}
                  </Link>
                ))}
            </div>
          ))}
        </div>

        <button
          style={styles.logoutBtn}
          onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
        >
          🚪 Se déconnecter
        </button>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Tu pars déjà ? 👋</h3>
            <p style={styles.modalText}>Es-tu sûr de vouloir te déconnecter de Knoweo ?</p>
            <div style={styles.modalButtons}>
              <button style={styles.modalCancel} onClick={() => setShowLogoutConfirm(false)}>
                Rester
              </button>
              <button style={styles.modalConfirm} onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  topBar: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
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
    gap: '12px',
    flexShrink: 0,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '5px',
    borderRadius: radius.sm,
  },
  hamburgerLine: {
    display: 'block',
    width: '22px',
    height: '2px',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
    transformOrigin: 'center',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'white',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  searchWrapper: {
    flex: 1,
    maxWidth: '480px',
    position: 'relative' as 'relative',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: '0 16px',
    gap: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    transition: 'background 0.2s',
  },
  searchIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'white',
    fontSize: '14px',
    padding: '10px 0',
  },
  searchSpinner: {
    fontSize: '12px',
    animation: 'spin 1s linear infinite',
  },
  searchClear: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px',
    flexShrink: 0,
  },
  searchDropdown: {
    position: 'absolute' as 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.xl,
    overflow: 'hidden',
    zIndex: 1100,
    border: `1px solid ${colors.border}`,
  },
  searchEmpty: {
    padding: '24px',
    textAlign: 'center' as 'center',
  },
  searchEmptyText: {
    color: colors.textMuted,
    fontSize: '14px',
    margin: 0,
  },
  searchResultsLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.8px',
    padding: '12px 16px 6px 16px',
    margin: 0,
  },
  searchResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderTop: `1px solid ${colors.border}`,
  },
  searchResultAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 2px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchResultEmail: {
    fontSize: '12px',
    color: colors.textMuted,
    margin: 0,
  },
  searchResultArrow: {
    color: colors.textMuted,
    fontSize: '16px',
    flexShrink: 0,
  },
  publicBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: colors.successLight,
    color: '#166534',
    padding: '2px 6px',
    borderRadius: radius.full,
  },
  langToggle: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
    padding: '3px',
  },
  langBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: radius.full,
    transition: 'all 0.2s',
  },
  langBtnActive: {
    backgroundColor: colors.accent,
    color: colors.primary,
  },
  profileWrapper: {
    position: 'relative' as 'relative',
  },
  avatar: {
    width: '36px',
    height: '36px',
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
  },
  profileDropdown: {
    position: 'absolute' as 'absolute',
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
    width: '40px',
    height: '40px',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  profileDropdownName: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.primary,
    margin: '0 0 2px 0',
  },
  profileDropdownEmail: {
    fontSize: '12px',
    color: colors.textMuted,
    margin: 0,
  },
  profileDropdownDivider: {
    height: '1px',
    backgroundColor: colors.border,
  },
  profileDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    color: colors.textPrimary,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.15s',
  },
  profileDropdownLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    color: '#EF4444',
    fontSize: '14px',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as 'left',
  },
  overlay: {
    position: 'fixed' as 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1001,
    backdropFilter: 'blur(2px)',
  },
  sidebar: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: colors.surface,
    zIndex: 1002,
    boxShadow: shadows.xl,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    overflowY: 'auto' as 'auto',
  },
  sidebarUser: {
    padding: '24px 20px',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sidebarAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  sidebarUserName: {
    color: 'white',
    fontWeight: '700',
    fontSize: '15px',
    margin: '0 0 2px 0',
  },
  sidebarUserEmail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    margin: 0,
  },
  menuItems: {
    flex: 1,
    padding: '8px 12px',
  },
  menuSection: {
    marginBottom: '8px',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: '1px',
    textTransform: 'uppercase' as 'uppercase',
    padding: '8px 8px 4px 8px',
    margin: 0,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 12px',
    borderRadius: radius.md,
    color: colors.textSecondary,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.15s',
    position: 'relative' as 'relative',
    marginBottom: '2px',
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
    color: colors.primary,
    fontWeight: '700',
  },
  menuIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center' as 'center',
  },
  activeIndicator: {
    position: 'absolute' as 'absolute',
    right: '12px',
    width: '6px',
    height: '6px',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  logoutBtn: {
    margin: '12px',
    padding: '12px 16px',
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
    border: 'none',
    borderRadius: radius.md,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left' as 'left',
  },
  modalOverlay: {
    position: 'fixed' as 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: '40px',
    maxWidth: '380px',
    width: '90%',
    boxShadow: shadows.xl,
    textAlign: 'center' as 'center',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0 0 12px 0',
  },
  modalText: {
    fontSize: '15px',
    color: colors.textSecondary,
    margin: '0 0 32px 0',
    lineHeight: '1.6',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
  },
  modalCancel: {
    flex: 1,
    padding: '13px',
    borderRadius: radius.md,
    border: `2px solid ${colors.border}`,
    backgroundColor: 'white',
    color: colors.textPrimary,
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalConfirm: {
    flex: 1,
    padding: '13px',
    borderRadius: radius.md,
    border: 'none',
    backgroundColor: '#EF4444',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default Navigation;