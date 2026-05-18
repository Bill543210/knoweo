import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { colors, shadows, radius, font } from '../styles';
import api from '../services/api';

// ── TYPES ─────────────────────────────────────────────────────────────────────

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

interface DomainStat {
  domainId: string;
  category: string;
  attempts: number;
  correctCount: number;
  masteredCount: number;
  successRate: number;
}

interface QuestionInsight {
  questionId: string;
  domainId: string;
  successRate: number;
  textFr: string;
  textEn: string;
  isInterviewQuestion: boolean;
}

interface InterviewReadiness {
  domainId: string;
  category: string;
  totalInterviewQuestions: number;
  correctInterviewQuestions: number;
  readinessScore: number;
}

interface DashboardData {
  domainStats: DomainStat[];
  strongQuestions: QuestionInsight[];
  weakQuestions: QuestionInsight[];
  todayCount: number;
  interviewReadiness: InterviewReadiness[];
}

interface Domain {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  color: string;
  icon: string;
  category: string;
}

// ── CONSTANTES ────────────────────────────────────────────────────────────────

const BADGE_THRESHOLDS = [
  { label: 'Bronze',  min: 5,   icon: '🥉', color: '#CD7F32' },
  { label: 'Argent',  min: 20,  icon: '🥈', color: '#9CA3AF' },
  { label: 'Or',      min: 50,  icon: '🥇', color: '#F5A623' },
  { label: 'Platine', min: 100, icon: '💎', color: '#6366F1' },
];

const GLOBAL_BADGES = [
  { id: 'streak7',  icon: '🔥', label: 'En feu',     desc: '7 jours consécutifs',     check: (s: Stats) => s.currentStreak >= 7 },
  { id: 'precise',  icon: '🎯', label: 'Précis',      desc: '80% de réussite globale', check: (s: Stats) => s.correctRate >= 80 },
  { id: 'curious',  icon: '🧠', label: 'Curieux',     desc: '50 questions répondues',  check: (s: Stats) => s.questionsAnswered >= 50 },
  { id: 'scholar',  icon: '📚', label: 'Érudit',      desc: '200 questions répondues', check: (s: Stats) => s.questionsAnswered >= 200 },
  { id: 'master',   icon: '🏆', label: 'Expert',      desc: '500 questions répondues', check: (s: Stats) => s.questionsAnswered >= 500 },
  { id: 'streak30', icon: '⚡', label: 'Légendaire',  desc: '30 jours consécutifs',    check: (s: Stats) => s.currentStreak >= 30 },
];

// Catégorie → route learn
const CATEGORY_ROUTE: { [key: string]: string } = {
  finance:   'finance',
  economie:  'economie',
  data:      'data',
  strategy:  'strategy',
  law:       'law',
  management:'management',
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const getDomainBadge = (n: number) => {
  let b = null;
  for (const t of BADGE_THRESHOLDS) if (n >= t.min) b = t;
  return b;
};

const getNextBadge = (n: number) => {
  for (const t of BADGE_THRESHOLDS) if (n < t.min) return t;
  return null;
};

const getInterviewLevel = (score: number, attempts: number) => {
  if (attempts < 5)  return { label: 'Pas assez de données', color: colors.textMuted, desc: 'Réponds à plus de questions d\'entretien', pct: 0 };
  if (score >= 85)   return { label: '⭐ Expert',    color: '#6366F1', desc: 'Niveau banquier d\'affaires confirmé', pct: 100 };
  if (score >= 70)   return { label: '✅ Senior',    color: '#22C55E', desc: 'Prêt pour un entretien junior/senior',  pct: 75 };
  if (score >= 55)   return { label: '🟡 Junior',    color: '#F5A623', desc: 'Niveau stage/alternance',              pct: 50 };
  return               { label: '🔴 En cours',       color: '#EF4444', desc: 'Continue à t\'entraîner',              pct: 25 };
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome]   = useState(true);
  const [stats, setStats]               = useState<Stats | null>(null);
  const [dashData, setDashData]         = useState<DashboardData | null>(null);
  const [domains, setDomains]           = useState<Domain[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [currentTime]                   = useState(new Date());
  const [activeTab, setActiveTab]       = useState<'overview' | 'domains' | 'badges'>('overview');

  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Nouveaux états
const [todayData, setTodayData]         = useState<{ questionsAnswered: number; dailyGoal: number } | null>(null);
const [activityData, setActivityData]   = useState<any[]>([]);
const [activityPeriod, setActivityPeriod] = useState<7 | 30 | 90>(30);

useEffect(() => {
  Promise.all([
    api.get('/user-progress/stats'),
    api.get('/questions/dashboard'),
    api.get('/domains'),
    api.get('/user-progress/today'),
    api.get(`/user-progress/activity?days=90`),
  ]).then(([s, d, dom, today, activity]) => {
    setStats(s.data);
    setDashData(d.data);
    setDomains(dom.data);
    setTodayData(today.data);
    setActivityData(activity.data);
  }).catch(console.error)
    .finally(() => setIsLoading(false));
}, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getDomainById    = (id: string)   => domains.find(d => d.id === id);
  const getCategoryRoute = (cat: string)  => CATEGORY_ROUTE[cat] || 'finance';

  // Domaine le plus travaillé
  const topDomain     = dashData?.domainStats.length
    ? [...dashData.domainStats].sort((a, b) => b.attempts - a.attempts)[0]
    : null;
  const topDomainInfo = topDomain ? getDomainById(topDomain.domainId) : null;
  const topRoute      = topDomainInfo ? getCategoryRoute(topDomainInfo.category) : 'finance';

  const xpLevel   = Math.floor((stats?.totalXP || 0) / 100) + 1;
  const xpInLevel = (stats?.totalXP || 0) % 100;
  const hasData   = (stats?.questionsAnswered || 0) > 0;

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <div style={{ textAlign: 'center' as const }}>
        <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>⏳</p>
        <p style={{ color: colors.textMuted }}>Chargement de ton espace...</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
      <Navigation />

      {/* WELCOME TOAST */}
      {showWelcome && (
        <div style={{ position: 'fixed' as const, top: '80px', right: '24px', backgroundColor: colors.primary, borderLeft: `4px solid ${colors.accent}`, borderRadius: radius.lg, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 999, boxShadow: shadows.lg, maxWidth: '320px' }}>
          <span style={{ fontSize: '28px' }}>👋</span>
          <div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: '0 0 2px 0' }}>{getGreeting()}, {user?.firstName} !</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
              {hasData ? `${(dashData?.todayCount ?? 0)} question${(dashData?.todayCount ?? 0) > 1 ? 's' : ''} aujourd'hui` : 'Prêt à apprendre ?'}
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', marginLeft: 'auto' }}>✕</button>
        </div>
      )}

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '88px 24px 64px', display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>
              {getGreeting()}, {user?.firstName} 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>Niv. {xpLevel}</span>
                <div style={{ width: '80px', height: '6px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${xpInLevel}%`, backgroundColor: colors.accent, borderRadius: radius.full, transition: 'width 0.6s' }} />
                </div>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>{xpInLevel}/100 XP</span>
              </div>
              {(stats?.currentStreak ?? 0) > 0 && (
                <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '700' }}>
                  🔥 {stats!.currentStreak} jour{stats!.currentStreak > 1 ? 's' : ''} de suite
                </span>
              )}
              {(dashData?.todayCount ?? 0) > 0 && (
                <span style={{ fontSize: '13px', color: colors.success, fontWeight: '600' }}>
                  ✅ {dashData!.todayCount} question{dashData!.todayCount > 1 ? 's' : ''} aujourd'hui
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(topDomainInfo ? `/learn/${topRoute}/infini` : '/learn')}
            style={{ backgroundColor: colors.accent, color: colors.primary, border: 'none', borderRadius: radius.md, padding: '14px 24px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: shadows.md }}
          >
            <span>▶</span>
            <span>{topDomainInfo ? `Continuer — ${topDomainInfo.nameFr}` : 'Commencer à apprendre'}</span>
          </button>
        </div>

        {/* ── KPI CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'XP total',           value: (stats?.totalXP || 0).toLocaleString(), sub: `Niveau ${xpLevel}`,                           color: colors.accent,  icon: '⭐' },
            { label: 'Série actuelle',      value: `${stats?.currentStreak || 0}j`,        sub: `Record : ${stats?.maxStreak || 0} jours`,      color: '#EF4444',      icon: '🔥' },
            { label: 'Taux de réussite',    value: `${stats?.correctRate || 0}%`,           sub: `${stats?.questionsAnswered || 0} questions`,   color: '#22C55E',      icon: '🎯' },
            { label: 'Domaines travaillés', value: dashData?.domainStats.length || 0,       sub: `sur ${domains.length} disponibles`,            color: '#6366F1',      icon: '📚' },
          ].map(k => (
            <div key={k.label} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '20px 24px', boxShadow: shadows.sm, borderTop: `4px solid ${k.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{k.label}</p>
                <span style={{ fontSize: '20px' }}>{k.icon}</span>
              </div>
              <p style={{ fontSize: '30px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0', lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── ONGLETS ── */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.surface, borderRadius: radius.lg, padding: '6px', boxShadow: shadows.sm, width: 'fit-content' }}>
          {([
            { id: 'overview', label: '📊 Vue globale' },
            { id: 'domains',  label: '📈 Par domaine' },
            { id: 'badges',   label: '🏅 Badges' },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '8px 20px', borderRadius: radius.md, border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', fontFamily: font.family, backgroundColor: activeTab === tab.id ? colors.primary : 'transparent', color: activeTab === tab.id ? 'white' : colors.textSecondary }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB OVERVIEW ── */}
        {activeTab === 'overview' && (
  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>

    {/* ── LIGNE 1 : Objectif + Activité côte à côte ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

      {/* WIDGET OBJECTIF DU JOUR */}
      {todayData && (
  <DailyGoalWidget
    done={dashData?.todayCount ?? todayData.questionsAnswered}
          goal={todayData.dailyGoal || 10}
          onLearn={() => navigate(topDomainInfo ? `/learn/${topRoute}/infini` : '/learn')}
          onSettings={() => navigate('/settings')}
        />
      )}

      {/* GRAPHE D'ACTIVITÉ */}
      <ActivityChart
        data={activityData}
        period={activityPeriod}
        onPeriodChange={setActivityPeriod}
      />
    </div>

    {/* ── LIGNE 2 : Reprendre (si données) ── */}
    {hasData && topDomain && topDomainInfo && (
      <div style={{ backgroundColor: colors.primary, borderRadius: radius.xl, padding: '24px 28px', boxShadow: shadows.md, position: 'relative' as const, overflow: 'hidden' }}>
        <div style={{ position: 'absolute' as const, top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.08 }}>{topDomainInfo.icon}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Reprendre</p>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', margin: '0 0 4px 0' }}>{topDomainInfo.nameFr}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              {topDomain.attempts} questions · {topDomain.successRate}% de réussite · {topDomain.masteredCount} maîtrisées
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
            {[
              { label: '♾️ Infini',    path: `/learn/${topRoute}/infini`,    bg: colors.accent,            color: colors.primary },
              { label: '🎯 Révision',  path: `/learn/${topRoute}/revision`,  bg: 'rgba(255,255,255,0.12)', color: 'white' },
              { label: '🎙️ Entretien', path: `/learn/${topRoute}/entretien`, bg: 'rgba(245,158,11,0.25)',  color: '#F59E0B' },
            ].map(btn => (
              <button key={btn.path} onClick={() => navigate(btn.path)}
                style={{ padding: '9px 16px', backgroundColor: btn.bg, color: btn.color, border: `1px solid ${btn.color === 'white' ? 'rgba(255,255,255,0.2)' : 'transparent'}`, borderRadius: radius.md, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* ── LIGNE 3 : Points forts + À améliorer côte à côte ── */}
    {hasData && (dashData?.strongQuestions.length || dashData?.weakQuestions.length) ? (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* POINTS FORTS */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 14px 0' }}>💪 Points forts</h2>
          {!dashData?.strongQuestions.length ? (
            <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>
              Réponds 2 fois aux mêmes questions pour voir tes points forts.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
              {dashData.strongQuestions.map((q, i) => {
                const d   = getDomainById(q.domainId);
                const cat = getCategoryRoute(d?.category || 'finance');
                return (
                  <div key={i} style={{ padding: '10px 12px', backgroundColor: '#DCFCE7', borderRadius: radius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '12px' }}>{d?.icon || '📘'}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#166534', backgroundColor: 'rgba(34,197,94,0.15)', padding: '1px 5px', borderRadius: radius.full }}>{d?.nameFr}</span>
                        {q.isInterviewQuestion && <span style={{ fontSize: '10px', color: '#92400E', backgroundColor: '#FEF3C7', padding: '1px 5px', borderRadius: radius.full }}>🎙️</span>}
                      </div>
                      <p style={{ fontSize: '11px', color: '#166534', margin: 0, lineHeight: '1.4', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        "{q.textFr}"
                      </p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#166534', flexShrink: 0 }}>{q.successRate}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* À AMÉLIORER */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 14px 0' }}>🎯 À améliorer</h2>
          {!dashData?.weakQuestions.length ? (
            <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>
              Tes axes de progression apparaîtront après quelques sessions.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
              {dashData.weakQuestions.map((q, i) => {
                const d   = getDomainById(q.domainId);
                const cat = getCategoryRoute(d?.category || 'finance');
                return (
                  <div key={i} style={{ padding: '10px 12px', backgroundColor: '#FEE2E2', borderRadius: radius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '12px' }}>{d?.icon || '📘'}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#991B1B', backgroundColor: 'rgba(239,68,68,0.12)', padding: '1px 5px', borderRadius: radius.full }}>{d?.nameFr}</span>
                        {q.isInterviewQuestion && <span style={{ fontSize: '10px', color: '#92400E', backgroundColor: '#FEF3C7', padding: '1px 5px', borderRadius: radius.full }}>🎙️</span>}
                      </div>
                      <p style={{ fontSize: '11px', color: '#991B1B', margin: 0, lineHeight: '1.4', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        "{q.textFr}"
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#991B1B' }}>{q.successRate}%</span>
                      <button onClick={() => navigate(`/learn/${cat}/revision`)}
                        style={{ fontSize: '10px', color: 'white', background: '#EF4444', border: 'none', borderRadius: radius.full, padding: '2px 7px', cursor: 'pointer', fontFamily: font.family }}>
                        Réviser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    ) : !hasData ? (
      /* État vide — première visite */
      <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '48px', textAlign: 'center' as const, boxShadow: shadows.sm }}>
        <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>🚀</p>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>Bienvenue sur Knoweo !</h3>
        <p style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 24px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
          Lance ta première session pour voir ta progression, tes points forts et tes axes d'amélioration.
        </p>
        <button onClick={() => navigate('/learn')}
          style={{ padding: '14px 28px', backgroundColor: colors.accent, color: colors.primary, border: 'none', borderRadius: radius.md, fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: font.family }}>
          ▶ Commencer à apprendre
        </button>
      </div>
    ) : null}

    {/* ── LIGNE 4 : Préparation entretien (si données) ── */}
    {(dashData?.interviewReadiness?.length ?? 0) > 0 && (
      <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: 0 }}>🎙️ Préparation entretien</h2>
          <button onClick={() => navigate(`/learn/${topRoute}/entretien`)}
            style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B', backgroundColor: '#FEF3C7', border: 'none', borderRadius: radius.full, padding: '4px 12px', cursor: 'pointer', fontFamily: font.family }}>
            S'entraîner →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {dashData!.interviewReadiness.map((r, i) => {
            const d     = getDomainById(r.domainId);
            const level = getInterviewLevel(r.readinessScore, r.totalInterviewQuestions);
            return (
              <div key={i} style={{ padding: '14px 16px', backgroundColor: `${level.color}10`, borderRadius: radius.md, border: `1px solid ${level.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{d?.icon || '📘'}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.primary }}>{d?.nameFr}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: level.color, backgroundColor: `${level.color}15`, padding: '2px 8px', borderRadius: radius.full }}>
                    {level.label}
                  </span>
                </div>
                <div style={{ height: '5px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${r.readinessScore}%`, backgroundColor: level.color, borderRadius: radius.full }} />
                </div>
                <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
                  {r.correctInterviewQuestions}/{r.totalInterviewQuestions} réussies · {level.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* ── LIGNE 5 : Statistiques + Accès rapide côte à côte ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

      {/* STATISTIQUES */}
      <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>📊 Statistiques</h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const }}>
          {[
            { label: 'Questions répondues', value: stats?.questionsAnswered || 0,  icon: '❓', color: colors.primary },
            { label: 'Bonnes réponses',      value: stats?.correctAnswers || 0,     icon: '✅', color: '#22C55E'     },
            { label: 'Mauvaises réponses',   value: (stats?.questionsAnswered || 0) - (stats?.correctAnswers || 0), icon: '❌', color: '#EF4444' },
            { label: 'Série maximale',       value: `${stats?.maxStreak || 0}j`,    icon: '🔥', color: '#F5A623'     },
            { label: 'XP total',             value: (stats?.totalXP || 0).toLocaleString(), icon: '⭐', color: colors.accent },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px' }}>{s.icon}</span>
                <span style={{ fontSize: '13px', color: colors.textSecondary }}>{s.label}</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '800', color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        {hasData && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: colors.textMuted }}>🏁 Objectif 1000 questions</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: colors.primary }}>{Math.round(((stats?.questionsAnswered || 0) / 1000) * 100)}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(((stats?.questionsAnswered || 0) / 1000) * 100, 100)}%`, background: `linear-gradient(90deg, ${colors.primary}, #6366F1)`, borderRadius: radius.full, transition: 'width 0.6s' }} />
            </div>
          </div>
        )}
      </div>

      {/* ACCÈS RAPIDE */}
      <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 14px 0' }}>⚡ Accès rapide</h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
          {[
            { label: '♾️ Mode Infini',           path: `/learn/${topRoute}/infini`,    color: colors.primary },
            { label: '🎯 Mode Révision',          path: `/learn/${topRoute}/revision`,  color: '#6366F1'      },
            { label: '📝 Mode Examen',            path: `/learn/${topRoute}/examen`,    color: '#EF4444'      },
            { label: '🎙️ Mode Entretien',         path: `/learn/${topRoute}/entretien`, color: '#F59E0B'      },
            { label: '🗂️ Changer de discipline',  path: '/learn',                       color: colors.textSecondary },
            { label: '🏆 Voir le classement',     path: '/leaderboard',                 color: '#6366F1'      },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ padding: '10px 14px', borderRadius: radius.md, border: `1px solid ${colors.border}`, backgroundColor: 'white', color: item.color, fontSize: '13px', fontWeight: '700', cursor: 'pointer', textAlign: 'left' as const, fontFamily: font.family }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>

  </div>
        )}

        {/* ── TAB DOMAINS ── */}
        {activeTab === 'domains' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
            {!hasData ? (
              <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '48px', textAlign: 'center' as const, boxShadow: shadows.sm }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>📚</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 8px 0' }}>Commence à apprendre !</p>
                <p style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 20px 0' }}>Ta progression par domaine apparaîtra ici.</p>
                <button onClick={() => navigate('/learn')}
                  style={{ padding: '12px 24px', backgroundColor: colors.accent, color: colors.primary, border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                  Lancer ma première session →
                </button>
              </div>
            ) : (
              domains.map(domain => {
                const stat        = dashData?.domainStats.find(s => s.domainId === domain.id);
                const badge       = stat ? getDomainBadge(stat.masteredCount) : null;
                const nextBadge   = stat ? getNextBadge(stat.masteredCount) : BADGE_THRESHOLDS[0];
                const interview   = dashData?.interviewReadiness.find(r => r.domainId === domain.id);
                const iLevel      = interview ? getInterviewLevel(interview.readinessScore, interview.totalInterviewQuestions) : null;
                const cat         = getCategoryRoute(domain.category);
                const progressPct = nextBadge && stat ? Math.min((stat.masteredCount / nextBadge.min) * 100, 100) : 100;

                return (
                  <div key={domain.id} style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '24px 28px', boxShadow: shadows.sm, borderLeft: `4px solid ${domain.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' as const, gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{domain.icon}</span>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.primary, margin: 0 }}>{domain.nameFr}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' as const }}>
                            {badge && (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, backgroundColor: `${badge.color}15`, padding: '2px 8px', borderRadius: radius.full }}>
                                {badge.icon} {badge.label}
                              </span>
                            )}
                            {iLevel && (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: iLevel.color, backgroundColor: `${iLevel.color}15`, padding: '2px 8px', borderRadius: radius.full }}>
                                🎙️ {iLevel.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/learn/${cat}/revision`)}
                          style={{ padding: '7px 12px', backgroundColor: colors.background, color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                          🎯 Réviser
                        </button>
                        <button onClick={() => navigate(`/learn/${cat}/infini`)}
                          style={{ padding: '7px 14px', backgroundColor: domain.color, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                          Continuer →
                        </button>
                      </div>
                    </div>

                    {stat ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
                          {[
                            { label: 'Questions', value: stat.attempts,      color: colors.primary },
                            { label: 'Correctes', value: stat.correctCount,  color: '#22C55E'      },
                            { label: 'Réussite',  value: `${stat.successRate}%`, color: stat.successRate >= 70 ? '#22C55E' : stat.successRate >= 50 ? '#F5A623' : '#EF4444' },
                            { label: 'Maîtrisées',value: stat.masteredCount, color: '#6366F1'      },
                          ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' as const, padding: '10px', backgroundColor: colors.background, borderRadius: radius.md }}>
                              <p style={{ fontSize: '18px', fontWeight: '800', color: s.color, margin: '0 0 2px 0' }}>{s.value}</p>
                              <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{s.label}</p>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '11px', color: colors.textMuted }}>Taux de réussite</span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: domain.color }}>{stat.successRate}%</span>
                          </div>
                          <div style={{ height: '5px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stat.successRate}%`, backgroundColor: domain.color, borderRadius: radius.full, transition: 'width 0.6s' }} />
                          </div>
                        </div>

                        {nextBadge && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span style={{ fontSize: '11px', color: colors.textMuted }}>
                                {nextBadge.icon} Badge {nextBadge.label} ({stat.masteredCount}/{nextBadge.min})
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: nextBadge.color }}>{Math.round(progressPct)}%</span>
                            </div>
                            <div style={{ height: '5px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: nextBadge.color, borderRadius: radius.full }} />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: '14px', backgroundColor: colors.background, borderRadius: radius.md, textAlign: 'center' as const }}>
                        <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Aucune session dans ce domaine.</p>
                        <button onClick={() => navigate(`/learn/${cat}/infini`)}
                          style={{ marginTop: '8px', padding: '6px 14px', backgroundColor: domain.color, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                          Commencer →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB BADGES ── */}
        {activeTab === 'badges' && stats && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

            <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '28px', boxShadow: shadows.sm }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: 0 }}>🌍 Badges globaux</h2>
                <span style={{ fontSize: '12px', fontWeight: '700', color: colors.accent, backgroundColor: colors.accentLight, padding: '4px 10px', borderRadius: radius.full }}>
                  {GLOBAL_BADGES.filter(b => b.check(stats)).length}/{GLOBAL_BADGES.length} obtenus
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {GLOBAL_BADGES.map(badge => {
                  const earned = badge.check(stats);
                  return (
                    <div key={badge.id} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', textAlign: 'center' as const, gap: '8px', padding: '20px 12px', borderRadius: radius.lg, backgroundColor: earned ? colors.accentLight : colors.background, border: `2px solid ${earned ? colors.accent : colors.border}`, opacity: earned ? 1 : 0.5, filter: earned ? 'none' : 'grayscale(1)' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', backgroundColor: earned ? 'white' : colors.border }}>
                        {badge.icon}
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: colors.primary, margin: 0 }}>{badge.label}</p>
                      <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0, lineHeight: '1.4' }}>{badge.desc}</p>
                      {earned && <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: radius.full }}>✓ Obtenu</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '28px', boxShadow: shadows.sm }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0' }}>📚 Badges par domaine</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
                {domains.map(domain => {
                  const stat    = dashData?.domainStats.find(s => s.domainId === domain.id);
                  const mastered = stat?.masteredCount || 0;
                  return (
                    <div key={domain.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{domain.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: colors.primary }}>{domain.nameFr}</span>
                        <span style={{ fontSize: '12px', color: colors.textMuted }}>· {mastered} maîtrisées</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {BADGE_THRESHOLDS.map(t => {
                          const earned  = mastered >= t.min;
                          const progress = Math.min((mastered / t.min) * 100, 100);
                          return (
                            <div key={t.label} style={{ textAlign: 'center' as const, padding: '14px 8px', borderRadius: radius.md, backgroundColor: earned ? `${t.color}15` : colors.background, border: `2px solid ${earned ? t.color : colors.border}`, opacity: earned ? 1 : 0.6 }}>
                              <p style={{ fontSize: '22px', margin: '0 0 4px 0', filter: earned ? 'none' : 'grayscale(1)' }}>{t.icon}</p>
                              <p style={{ fontSize: '12px', fontWeight: '700', color: earned ? t.color : colors.textMuted, margin: '0 0 6px 0' }}>{t.label}</p>
                              {!earned ? (
                                <>
                                  <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginBottom: '4px' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, backgroundColor: t.color, borderRadius: radius.full }} />
                                  </div>
                                  <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{mastered}/{t.min}</p>
                                </>
                              ) : (
                                <span style={{ fontSize: '10px', fontWeight: '700', color: t.color }}>✓ Obtenu</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

// ── WIDGET OBJECTIF DU JOUR ───────────────────────────────────────────────────

const DailyGoalWidget = ({
  done, goal, onLearn, onSettings,
}: {
  done: number;
  goal: number;
  onLearn: () => void;
  onSettings: () => void;
}) => {
  const pct       = Math.min((done / goal) * 100, 100);
  const completed = done >= goal;
  const remaining = Math.max(goal - done, 0);

  // Cercle SVG
  const SIZE   = 80;
  const STROKE = 7;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;
  const dash   = (pct / 100) * CIRC;

  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '20px 24px', boxShadow: shadows.sm }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: 0 }}>
          🎯 Objectif du jour
        </h2>
        <button onClick={onSettings}
          style={{ fontSize: '11px', color: colors.textMuted, background: 'none', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '3px 8px', cursor: 'pointer', fontFamily: font.family }}>
          Modifier
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Cercle de progression */}
        <div style={{ position: 'relative' as const, flexShrink: 0 }}>
          <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
            {/* Fond */}
            <circle cx={SIZE/2} cy={SIZE/2} r={R}
              fill="none" stroke={colors.border} strokeWidth={STROKE} />
            {/* Progression */}
            <circle cx={SIZE/2} cy={SIZE/2} r={R}
              fill="none"
              stroke={completed ? '#22C55E' : colors.accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          {/* Texte au centre */}
          <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: completed ? '#22C55E' : colors.primary, lineHeight: 1 }}>
              {done}
            </span>
            <span style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1 }}>
              /{goal}
            </span>
          </div>
        </div>

        {/* Texte */}
        <div style={{ flex: 1 }}>
          {completed ? (
            <>
              <p style={{ fontSize: '15px', fontWeight: '800', color: '#22C55E', margin: '0 0 4px 0' }}>
                ✅ Objectif atteint !
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 10px 0' }}>
                Tu as répondu à {done} questions aujourd'hui. Continue !
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '15px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0' }}>
                {remaining} question{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 10px 0' }}>
                {done === 0
                  ? 'Tu n\'as pas encore commencé aujourd\'hui.'
                  : `Encore ${remaining} pour atteindre ton objectif de ${goal}.`}
              </p>
            </>
          )}
          <button onClick={onLearn}
            style={{ padding: '7px 14px', backgroundColor: completed ? '#DCFCE7' : colors.accent, color: completed ? '#166534' : colors.primary, border: 'none', borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
            {completed ? '➕ Continuer' : '▶ S\'entraîner'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── GRAPHE D'ACTIVITÉ ─────────────────────────────────────────────────────────

const ActivityChart = ({
  data, period, onPeriodChange,
}: {
  data: any[];
  period: 7 | 30 | 90;
  onPeriodChange: (p: 7 | 30 | 90) => void;
}) => {
  const filtered = data.slice(-period);

  if (filtered.length === 0) return null;

  const maxQ    = Math.max(...filtered.map((d: any) => d.questionsAnswered), 1);
  const totalQ  = filtered.reduce((sum: number, d: any) => sum + d.questionsAnswered, 0);
  const activeDays = filtered.filter((d: any) => d.questionsAnswered > 0).length;
  const avgQ    = activeDays > 0 ? Math.round(totalQ / activeDays) : 0;

  // Pour 7j : affiche les barres individuelles
  // Pour 30j/90j : affiche un heatmap simplifié
  const showBars = period === 7;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (period === 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    if (period === 30) return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('fr-FR', { month: 'short' });
  };

  const getBarColor = (q: number) => {
    if (q === 0) return colors.border;
    if (q >= 20) return '#6366F1';
    if (q >= 10) return '#22C55E';
    return colors.accent;
  };

  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: 0 }}>
          📈 Activité
        </h2>
        <div style={{ display: 'flex', gap: '4px' }}>
          {([7, 30, 90] as const).map(p => (
            <button key={p} onClick={() => onPeriodChange(p)}
              style={{ padding: '4px 10px', borderRadius: radius.full, border: `1px solid ${period === p ? colors.primary : colors.border}`, backgroundColor: period === p ? colors.primary : 'white', color: period === p ? 'white' : colors.textMuted, fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
              {p}j
            </button>
          ))}
        </div>
      </div>

      {/* Stats résumées */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Total',    value: totalQ,       color: colors.primary },
          { label: 'Jours actifs', value: activeDays, color: '#22C55E'   },
          { label: 'Moy./jour',value: avgQ,          color: colors.accent },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' as const, padding: '8px', backgroundColor: colors.background, borderRadius: radius.md }}>
            <p style={{ fontSize: '16px', fontWeight: '800', color: s.color, margin: '0 0 2px 0' }}>{s.value}</p>
            <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Graphe */}
      {showBars ? (
        /* ── 7 jours : barres verticales ── */
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
          {filtered.map((d: any, i: number) => {
            const h   = maxQ > 0 ? Math.max((d.questionsAnswered / maxQ) * 72, d.questionsAnswered > 0 ? 4 : 0) : 0;
            const isToday = i === filtered.length - 1;
            return (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' }}>
                {/* Valeur au survol */}
                {d.questionsAnswered > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: getBarColor(d.questionsAnswered) }}>
                    {d.questionsAnswered}
                  </span>
                )}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end', height: '60px' }}>
                  <div style={{
                    width: '100%',
                    height: `${h}px`,
                    backgroundColor: getBarColor(d.questionsAnswered),
                    borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                    transition: 'height 0.4s ease',
                    border: isToday ? `2px solid ${colors.primary}` : 'none',
                  }} />
                </div>
                <span style={{ fontSize: '9px', color: isToday ? colors.primary : colors.textMuted, fontWeight: isToday ? '800' : '400', whiteSpace: 'nowrap' as const }}>
                  {isToday ? 'Auj.' : formatDate(d.date)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 30j / 90j : heatmap ── */
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '3px' }}>
            {filtered.map((d: any) => {
              const intensity = d.questionsAnswered === 0 ? 0
                : d.questionsAnswered < 5  ? 1
                : d.questionsAnswered < 10 ? 2
                : d.questionsAnswered < 20 ? 3
                : 4;
              const bgColor = [
                colors.border,
                `${colors.accent}40`,
                `${colors.accent}70`,
                colors.accent,
                '#F5A623',
              ][intensity];
              return (
                <div key={d.date} title={`${formatDate(d.date)} : ${d.questionsAnswered} questions`}
                  style={{ width: period === 30 ? '22px' : '10px', height: period === 30 ? '22px' : '10px', borderRadius: '3px', backgroundColor: bgColor, cursor: 'default', transition: 'background 0.2s' }} />
              );
            })}
          </div>
          {/* Légende */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <span style={{ fontSize: '10px', color: colors.textMuted }}>Moins</span>
            {[colors.border, `${colors.accent}40`, `${colors.accent}70`, colors.accent, '#F5A623'].map((c, i) => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: c }} />
            ))}
            <span style={{ fontSize: '10px', color: colors.textMuted }}>Plus</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;