import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';

interface Stats {
  totalXP: number;
  currentStreak: number;
  maxStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
  correctRate: number;
  battlesPlayed: number;
  battlesWon: number;
  totalTime: string;
  updatedAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/user-progress/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getLastUpdate = () => {
    if (!stats?.updatedAt) return 'Jamais';
    return new Date(stats.updatedAt).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const domains = [
    { name: 'M&A', progress: 0, questions: 0, color: '#6366F1', level: 'Débutant' },
    { name: 'Comptabilité', progress: 0, questions: 0, color: '#22C55E', level: 'Débutant' },
    { name: 'Private Equity', progress: 0, questions: 0, color: '#F5A623', level: 'Débutant' },
    { name: 'Marchés Financiers', progress: 0, questions: 0, color: '#EF4444', level: 'Débutant' },
    { name: 'IBD', progress: 0, questions: 0, color: '#8B5CF6', level: 'Débutant' },
  ];

  const badges = [
    { icon: '🔥', label: 'Série de 7', desc: 'Actif 7 jours consécutifs', earned: (stats?.maxStreak || 0) >= 7 },
    { icon: '⚔️', label: 'Guerrier', desc: '3 battles gagnées', earned: (stats?.battlesWon || 0) >= 3 },
    { icon: '🎯', label: 'Précis', desc: '80% de bonnes réponses', earned: (stats?.correctRate || 0) >= 80 },
    { icon: '🏆', label: 'Champion', desc: '10 battles gagnées', earned: (stats?.battlesWon || 0) >= 10 },
    { icon: '📚', label: 'Érudit', desc: '500 questions répondues', earned: (stats?.questionsAnswered || 0) >= 500 },
    { icon: '💎', label: 'Expert', desc: 'Maîtriser 3 domaines', earned: false },
  ];

  if (isLoading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingContent}>
        <p style={styles.loadingIcon}>⏳</p>
        <p style={styles.loadingText}>Chargement de ton espace...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navigation />

      {/* WELCOME TOAST */}
      {showWelcome && (
        <div style={styles.welcomeToast}>
          <span style={styles.welcomeIcon}>👋</span>
          <div>
            <p style={styles.welcomeTitle}>{getGreeting()}, {user?.firstName} !</p>
            <p style={styles.welcomeSubtitle}>Content de te revoir sur Knoweo</p>
          </div>
          <button style={styles.toastClose} onClick={() => setShowWelcome(false)}>✕</button>
        </div>
      )}

      <main style={styles.main}>
        {/* HEADER */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>{getGreeting()}, {user?.firstName} 👋</h1>
            <p style={styles.pageSubtitle}>
              Dernière mise à jour : {getLastUpdate()}
            </p>
          </div>
          <button style={styles.learnBtn} onClick={() => navigate('/learn')}>
            ▶ Continuer à apprendre
          </button>
        </div>

        {/* KPI CARDS */}
        <div style={styles.kpiGrid}>
          <div style={{ ...styles.kpiCard, borderTop: `4px solid ${colors.accent}` }}>
            <p style={styles.kpiLabel}>Points XP total</p>
            <p style={styles.kpiValue}>{(stats?.totalXP || 0).toLocaleString()}</p>
            <p style={styles.kpiSub}>Continue à progresser !</p>
          </div>
          <div style={{ ...styles.kpiCard, borderTop: '4px solid #EF4444' }}>
            <p style={styles.kpiLabel}>Série actuelle 🔥</p>
            <p style={styles.kpiValue}>{stats?.currentStreak || 0} jours</p>
            <p style={styles.kpiSub}>Record : {stats?.maxStreak || 0} jours</p>
          </div>
          <div style={{ ...styles.kpiCard, borderTop: '4px solid #22C55E' }}>
            <p style={styles.kpiLabel}>Taux de réussite</p>
            <p style={styles.kpiValue}>{stats?.correctRate || 0}%</p>
            <p style={styles.kpiSub}>{stats?.questionsAnswered || 0} questions répondues</p>
          </div>
          <div style={{ ...styles.kpiCard, borderTop: '4px solid #6366F1' }}>
            <p style={styles.kpiLabel}>Temps total</p>
            <p style={styles.kpiValue}>{stats?.totalTime || '0min'}</p>
            <p style={styles.kpiSub}>
              Battles : {stats?.battlesWon || 0}/{stats?.battlesPlayed || 0} gagnées
            </p>
          </div>
        </div>

        <div style={styles.grid2col}>
          {/* PROGRESSION PAR DOMAINE */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📈 Progression par domaine</h2>
              <span style={styles.cardBadge}>{domains.length} domaines</span>
            </div>
            {stats?.questionsAnswered === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyStateIcon}>📚</p>
                <p style={styles.emptyStateTitle}>Commence à apprendre !</p>
                <p style={styles.emptyStateText}>
                  Ta progression par domaine apparaîtra ici après tes premières sessions.
                </p>
                <button style={styles.emptyStateBtn} onClick={() => navigate('/learn')}>
                  Lancer ma première session →
                </button>
              </div>
            ) : (
              <div style={styles.domainList}>
                {domains.map((domain) => (
                  <div key={domain.name} style={styles.domainItem}>
                    <div style={styles.domainTop}>
                      <div style={styles.domainLeft}>
                        <span style={{ ...styles.domainDot, backgroundColor: domain.color }} />
                        <span style={styles.domainName}>{domain.name}</span>
                        <span style={styles.domainLevel}>{domain.level}</span>
                      </div>
                      <span style={styles.domainPercent}>{domain.progress}%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${domain.progress}%`,
                        backgroundColor: domain.color,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE */}
          <div style={styles.columnRight}>
            {/* POINTS FORTS */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💪 Points forts</h2>
              {stats?.questionsAnswered === 0 ? (
                <p style={styles.emptyText}>Réponds à des questions pour découvrir tes points forts !</p>
              ) : (
                <p style={styles.emptyText}>Données disponibles après tes premières sessions.</p>
              )}
            </div>

            {/* À AMÉLIORER */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🎯 À améliorer</h2>
              {stats?.questionsAnswered === 0 ? (
                <p style={styles.emptyText}>Lance une session pour identifier tes axes de progression !</p>
              ) : (
                <p style={styles.emptyText}>Données disponibles après tes premières sessions.</p>
              )}
            </div>
          </div>
        </div>

        {/* BADGES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>🏅 Badges</h2>
            <span style={styles.cardBadge}>
              {badges.filter(b => b.earned).length}/{badges.length} obtenus
            </span>
          </div>
          <div style={styles.badgeGrid}>
            {badges.map((badge) => (
              <div key={badge.label} style={{
                ...styles.badgeItem,
                opacity: badge.earned ? 1 : 0.4,
                filter: badge.earned ? 'none' : 'grayscale(1)',
              }}>
                <div style={{
                  ...styles.badgeIcon,
                  backgroundColor: badge.earned ? colors.accentLight : '#F1F5F9',
                  border: badge.earned ? `2px solid ${colors.accent}` : '2px solid #E2E8F0',
                }}>
                  {badge.icon}
                </div>
                <p style={styles.badgeLabel}>{badge.label}</p>
                <p style={styles.badgeDesc}>{badge.desc}</p>
                {badge.earned && <span style={styles.badgeEarned}>✓ Obtenu</span>}
              </div>
            ))}
          </div>
        </div>

        {/* STATS DÉTAILLÉES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>📊 Statistiques détaillées</h2>
            <span style={styles.updateLabel}>Mis à jour : {getLastUpdate()}</span>
          </div>
          <div style={styles.statsGrid}>
            {[
              { label: 'Questions répondues', value: stats?.questionsAnswered || 0, icon: '❓' },
              { label: 'Bonnes réponses', value: stats?.correctAnswers || 0, icon: '✅' },
              { label: 'Mauvaises réponses', value: (stats?.questionsAnswered || 0) - (stats?.correctAnswers || 0), icon: '❌' },
              { label: 'Battles jouées', value: stats?.battlesPlayed || 0, icon: '⚔️' },
              { label: 'Battles gagnées', value: stats?.battlesWon || 0, icon: '🏆' },
              { label: 'Temps total', value: stats?.totalTime || '0min', icon: '⏱️' },
              { label: 'XP total', value: (stats?.totalXP || 0).toLocaleString(), icon: '⭐' },
              { label: 'Série max', value: `${stats?.maxStreak || 0} jours`, icon: '🔥' },
            ].map(stat => (
              <div key={stat.label} style={styles.statItem}>
                <span style={styles.statIcon}>{stat.icon}</span>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    backgroundColor: colors.background,
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingContent: {
    textAlign: 'center' as 'center',
  },
  loadingIcon: {
    fontSize: '40px',
    margin: '0 0 16px 0',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: '16px',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '88px 24px 48px 24px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '24px',
  },
  welcomeToast: {
    position: 'fixed' as 'fixed',
    top: '80px',
    right: '24px',
    backgroundColor: colors.primary,
    borderLeft: `4px solid ${colors.accent}`,
    borderRadius: radius.lg,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 999,
    boxShadow: shadows.lg,
    maxWidth: '320px',
  },
  welcomeIcon: { fontSize: '28px', flexShrink: 0 },
  welcomeTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: '15px',
    margin: '0 0 2px 0',
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    margin: 0,
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: colors.textMuted,
    margin: 0,
  },
  learnBtn: {
    backgroundColor: colors.accent,
    color: colors.primary,
    border: 'none',
    borderRadius: radius.md,
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    flexShrink: 0,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: '24px',
    boxShadow: shadows.sm,
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.textMuted,
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px',
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0 0 4px 0',
    lineHeight: 1,
  },
  kpiSub: {
    fontSize: '12px',
    color: colors.textMuted,
    margin: 0,
  },
  grid2col: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: '28px',
    boxShadow: shadows.sm,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary,
    margin: 0,
  },
  cardBadge: {
    backgroundColor: colors.accentLight,
    color: colors.accent,
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: radius.full,
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '32px 16px',
  },
  emptyStateIcon: {
    fontSize: '40px',
    margin: '0 0 12px 0',
  },
  emptyStateTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary,
    margin: '0 0 8px 0',
  },
  emptyStateText: {
    fontSize: '14px',
    color: colors.textMuted,
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  emptyStateBtn: {
    backgroundColor: colors.accent,
    color: colors.primary,
    border: 'none',
    borderRadius: radius.md,
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  domainList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '20px',
  },
  domainItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '6px',
  },
  domainTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  domainDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  domainName: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.primary,
  },
  domainLevel: {
    fontSize: '11px',
    color: colors.textMuted,
    backgroundColor: colors.background,
    padding: '2px 8px',
    borderRadius: radius.full,
  },
  domainPercent: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.primary,
  },
  progressBar: {
    height: '8px',
    backgroundColor: colors.background,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    transition: 'width 0.6s ease',
  },
  columnRight: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '24px',
  },
  emptyText: {
    fontSize: '13px',
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: '1.5',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
  },
  badgeItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    textAlign: 'center' as 'center',
    gap: '8px',
    padding: '16px 12px',
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  badgeIcon: {
    width: '56px',
    height: '56px',
    borderRadius: radius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
  },
  badgeLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.primary,
    margin: 0,
  },
  badgeDesc: {
    fontSize: '11px',
    color: colors.textMuted,
    margin: 0,
    lineHeight: '1.4',
  },
  badgeEarned: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#166534',
    backgroundColor: '#DCFCE7',
    padding: '2px 8px',
    borderRadius: radius.full,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
  },
  statItem: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: '20px 16px',
    textAlign: 'center' as 'center',
  },
  statIcon: { fontSize: '24px' },
  statValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: colors.primary,
    margin: '8px 0 4px 0',
  },
  statLabel: {
    fontSize: '12px',
    color: colors.textMuted,
    margin: 0,
    lineHeight: '1.4',
  },
  updateLabel: {
    fontSize: '12px',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
};

export default Dashboard;