import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { colors, shadows, radius, font } from '../styles';
import api from '../services/api';

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank:              number;
  userId:            string;
  firstName:         string;
  lastName:          string;
  avatarUrl:         string | null;
  status:            string | null;
  jobTitle:          string | null;
  company:           string | null;
  totalXP:           number;
  currentStreak:     number;
  questionsAnswered?: number;
  correctRate?:       number;
  attempts?:          number;
  successRate?:       number;
  isCurrentUser:     boolean;
}

interface Domain {
  id:     string;
  slug:   string;
  nameFr: string;
  icon:   string;
  color:  string;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

const getRankDisplay = (rank: number) => {
  if (rank === 1) return { icon: '🥇', color: '#F5A623', bg: '#FEF3C7' };
  if (rank === 2) return { icon: '🥈', color: '#9CA3AF', bg: '#F3F4F6' };
  if (rank === 3) return { icon: '🥉', color: '#CD7F32', bg: '#FEF9EC' };
  return { icon: `#${rank}`, color: colors.textMuted, bg: 'transparent' };
};

const getXPLevel = (xp: number) => Math.floor(xp / 100) + 1;

const getStreakColor = (streak: number) => {
  if (streak >= 30) return '#6366F1';
  if (streak >= 14) return '#EF4444';
  if (streak >= 7)  return '#F5A623';
  return colors.textMuted;
};

// ── COMPOSANT ─────────────────────────────────────────────────────────────────

const Leaderboard = () => {
  const navigate              = useNavigate();
  const { user }              = useAuth();

  const [activeTab, setActiveTab]     = useState<'global' | 'friends' | 'domain'>('global');
  const [entries, setEntries]         = useState<LeaderboardEntry[]>([]);
  const [domains, setDomains]         = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isLoading, setIsLoading]     = useState(true);
  const [myRank, setMyRank]           = useState<LeaderboardEntry | null>(null);
  const [myRankVisible, setMyRankVisible] = useState(false);

  // ── Chargement des domaines ───────────────────────────────
  useEffect(() => {
    api.get('/domains').then(res => {
      setDomains(res.data);
      if (res.data.length > 0) setSelectedDomain(res.data[0].id);
    });
  }, []);

  // ── Chargement du leaderboard ─────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/user-progress/leaderboard?type=${activeTab}`;
      if (activeTab === 'domain' && selectedDomain) {
        url += `&domainId=${selectedDomain}`;
      }
      const res = await api.get(url);
      const data: LeaderboardEntry[] = res.data;
      setEntries(data);

      // Trouve la position de l'utilisateur connecté
      const me = data.find(e => e.isCurrentUser);
      if (me) {
        setMyRank(me);
        setMyRankVisible(me.rank > 10); // affiche le rang en bas seulement si hors top 10
      } else {
        setMyRank(null);
        setMyRankVisible(false);
      }
    } catch (err) {
      console.error(err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedDomain]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // ── RENDU ─────────────────────────────────────────────────

  const currentDomain = domains.find(d => d.id === selectedDomain);

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
      <Navigation />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '88px 24px 64px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 6px 0' }}>
            🏆 Classement
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
            Mesure-toi aux autres apprenants et grimpe dans le classement.
          </p>
        </div>

        {/* ── ONGLETS ── */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.surface, padding: '6px', borderRadius: radius.lg, boxShadow: shadows.sm, marginBottom: '20px' }}>
          {([
            { key: 'global',  label: '🌍 Mondial'  },
            { key: 'friends', label: '👥 Amis'     },
            { key: 'domain',  label: '📚 Par domaine' },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ flex: 1, padding: '10px 8px', borderRadius: radius.md, border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', fontFamily: font.family, backgroundColor: activeTab === tab.key ? colors.primary : 'transparent', color: activeTab === tab.key ? 'white' : colors.textMuted }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── FILTRE DOMAINE ── */}
        {activeTab === 'domain' && domains.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {domains.map(d => (
                <button key={d.id} onClick={() => setSelectedDomain(d.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: radius.full, border: `2px solid ${selectedDomain === d.id ? d.color : colors.border}`, backgroundColor: selectedDomain === d.id ? `${d.color}15` : 'white', color: selectedDomain === d.id ? d.color : colors.textSecondary, fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s', fontFamily: font.family }}>
                  <span>{d.icon}</span>
                  <span>{d.nameFr}</span>
                </button>
              ))}
            </div>
            {activeTab === 'domain' && (
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '10px 0 0 0' }}>
                Classement par taux de réussite · minimum 5 questions répondues dans ce domaine
              </p>
            )}
          </div>
        )}

        {/* ── PODIUM TOP 3 ── */}
        {!isLoading && entries.length >= 3 && (
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px 24px', boxShadow: shadows.sm, marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px' }}>
              {/* 2ème */}
              <PodiumCard entry={entries[1]} height={100} onNavigate={() => navigate(`/profile/${entries[1].userId}`)} isDomain={activeTab === 'domain'} />
              {/* 1er */}
              <PodiumCard entry={entries[0]} height={130} onNavigate={() => navigate(`/profile/${entries[0].userId}`)} isDomain={activeTab === 'domain'} />
              {/* 3ème */}
              <PodiumCard entry={entries[2]} height={80} onNavigate={() => navigate(`/profile/${entries[2].userId}`)} isDomain={activeTab === 'domain'} />
            </div>
          </div>
        )}

        {/* ── LISTE COMPLÈTE ── */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, boxShadow: shadows.sm, overflow: 'hidden' }}>

          {/* En-tête */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: colors.primary, margin: 0 }}>
              {activeTab === 'global'  && 'Classement mondial'}
              {activeTab === 'friends' && 'Classement entre amis'}
              {activeTab === 'domain'  && `Classement — ${currentDomain?.nameFr || ''}`}
            </p>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
              {entries.length} participant{entries.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Contenu */}
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' as const }}>
              <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>⏳</p>
              <p style={{ color: colors.textMuted, margin: 0 }}>Chargement...</p>
            </div>
          ) : entries.length === 0 ? (
            <EmptyState type={activeTab} onLearn={() => navigate('/learn')} />
          ) : (
            <div>
              {entries.map((entry, idx) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  isLast={idx === entries.length - 1}
                  isDomain={activeTab === 'domain'}
                  onClick={() => navigate(`/profile/${entry.userId}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── MON RANG (si hors top visible) ── */}
        {myRankVisible && myRank && (
          <div style={{
            position: 'fixed' as const, bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: colors.primary, borderRadius: radius.xl,
            padding: '12px 24px', boxShadow: shadows.xl, zIndex: 900,
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, whiteSpace: 'nowrap' as const }}>
              Ta position
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: colors.accent }}>
                #{myRank.rank}
              </span>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>
                {myRank.totalXP.toLocaleString()} XP
              </span>
              {activeTab === 'domain' && myRank.successRate !== undefined && (
                <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: '600' }}>
                  {myRank.successRate}% ✓
                </span>
              )}
            </div>
            <button
              onClick={() => setMyRankVisible(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
              ✕
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// ── CARTE PODIUM ──────────────────────────────────────────────────────────────

const PodiumCard = ({
  entry, height, onNavigate, isDomain,
}: {
  entry: LeaderboardEntry;
  height: number;
  onNavigate: () => void;
  isDomain: boolean;
}) => {
  const rank = getRankDisplay(entry.rank);
  return (
    <div onClick={onNavigate} style={{
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
      gap: '8px', cursor: 'pointer', flex: 1, maxWidth: '180px',
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative' as const }}>
        <div style={{
          width: entry.rank === 1 ? '72px' : '56px',
          height: entry.rank === 1 ? '72px' : '56px',
          borderRadius: '50%',
          backgroundColor: entry.isCurrentUser ? colors.accent : colors.primary,
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: entry.rank === 1 ? '24px' : '18px', fontWeight: '800',
          border: `3px solid ${rank.color}`, overflow: 'hidden',
          boxShadow: entry.rank === 1 ? shadows.md : 'none',
        }}>
          {entry.avatarUrl
            ? <img src={`http://localhost:3001${entry.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : `${entry.firstName[0]}${entry.lastName[0]}`}
        </div>
        <span style={{
          position: 'absolute' as const, bottom: '-4px', right: '-4px',
          fontSize: entry.rank === 1 ? '20px' : '16px',
        }}>
          {rank.icon}
        </span>
      </div>

      {/* Nom */}
      <div style={{ textAlign: 'center' as const }}>
        <p style={{ fontSize: '13px', fontWeight: '800', color: entry.isCurrentUser ? colors.accent : colors.primary, margin: '0 0 2px 0', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
          {entry.isCurrentUser ? 'Toi' : `${entry.firstName} ${entry.lastName[0]}.`}
        </p>
        {isDomain && entry.successRate !== undefined ? (
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#22C55E', margin: 0 }}>
            {entry.successRate}% ✓
          </p>
        ) : (
          <p style={{ fontSize: '12px', fontWeight: '700', color: rank.color, margin: 0 }}>
            {entry.totalXP.toLocaleString()} XP
          </p>
        )}
      </div>

      {/* Barre podium */}
      <div style={{
        width: '100%', height: `${height}px`,
        backgroundColor: rank.bg || `${rank.color}15`,
        borderRadius: `${radius.md} ${radius.md} 0 0`,
        border: `2px solid ${rank.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '24px', fontWeight: '800', color: rank.color }}>
          {entry.rank}
        </span>
      </div>
    </div>
  );
};

// ── LIGNE DU CLASSEMENT ───────────────────────────────────────────────────────

const LeaderboardRow = ({
  entry, isLast, isDomain, onClick,
}: {
  entry: LeaderboardEntry;
  isLast: boolean;
  isDomain: boolean;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const rank   = getRankDisplay(entry.rank);
  const level  = getXPLevel(entry.totalXP);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${colors.border}`,
        cursor: 'pointer',
        backgroundColor: entry.isCurrentUser
          ? `${colors.accent}08`
          : hovered ? colors.background : 'transparent',
        transition: 'background 0.15s',
        borderLeft: entry.isCurrentUser ? `3px solid ${colors.accent}` : '3px solid transparent',
      }}
    >
      {/* Rang */}
      <div style={{
        width: '36px', textAlign: 'center' as const, flexShrink: 0,
        fontSize: entry.rank <= 3 ? '20px' : '14px',
        fontWeight: '800',
        color: rank.color,
      }}>
        {entry.rank <= 3 ? rank.icon : `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        backgroundColor: entry.isCurrentUser ? colors.accent : colors.primary,
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: '700', flexShrink: 0, overflow: 'hidden',
        border: entry.isCurrentUser ? `2px solid ${colors.accent}` : 'none',
      }}>
        {entry.avatarUrl
          ? <img src={`http://localhost:3001${entry.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : `${entry.firstName[0]}${entry.lastName[0]}`}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: entry.isCurrentUser ? colors.accent : colors.primary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            {entry.isCurrentUser ? `${entry.firstName} ${entry.lastName} (toi)` : `${entry.firstName} ${entry.lastName}`}
          </p>
          <span style={{ fontSize: '10px', fontWeight: '700', color: colors.textMuted, backgroundColor: colors.background, padding: '1px 6px', borderRadius: radius.full, flexShrink: 0 }}>
            Niv. {level}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
          {entry.status === 'professional' && entry.jobTitle
            ? `${entry.jobTitle}${entry.company ? ` · ${entry.company}` : ''}`
            : entry.status === 'student' ? '🎓 Étudiant' : ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {isDomain && entry.successRate !== undefined ? (
          <>
            <div style={{ textAlign: 'right' as const }}>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#22C55E', margin: 0 }}>{entry.successRate}%</p>
              <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>réussite</p>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textSecondary, margin: 0 }}>{entry.attempts}</p>
              <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>tentatives</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'right' as const }}>
              <p style={{ fontSize: '16px', fontWeight: '800', color: colors.primary, margin: 0 }}>
                {entry.totalXP.toLocaleString()}
              </p>
              <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>XP</p>
            </div>
            {entry.correctRate !== undefined && (
              <div style={{ textAlign: 'right' as const }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#22C55E', margin: 0 }}>{entry.correctRate}%</p>
                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>réussite</p>
              </div>
            )}
          </>
        )}
        {entry.currentStreak > 0 && (
          <div style={{ textAlign: 'right' as const }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: getStreakColor(entry.currentStreak), margin: 0 }}>
              {entry.currentStreak}🔥
            </p>
            <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>série</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── ÉTAT VIDE ─────────────────────────────────────────────────────────────────

const EmptyState = ({
  type, onLearn,
}: {
  type: 'global' | 'friends' | 'domain';
  onLearn: () => void;
}) => (
  <div style={{ padding: '48px', textAlign: 'center' as const }}>
    <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>
      {type === 'friends' ? '👥' : '📊'}
    </p>
    <p style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 8px 0' }}>
      {type === 'friends'
        ? 'Aucun ami dans le classement'
        : type === 'domain'
        ? 'Pas encore de données sur ce domaine'
        : 'Aucun utilisateur dans le classement'}
    </p>
    <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 20px 0' }}>
      {type === 'friends'
        ? 'Ajoute des amis depuis ton profil pour les voir ici.'
        : 'Réponds à au moins 5 questions dans ce domaine pour apparaître.'}
    </p>
    <button onClick={onLearn}
      style={{ padding: '10px 24px', backgroundColor: colors.accent, color: colors.primary, border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
      Commencer à apprendre →
    </button>
  </div>
);

export default Leaderboard;