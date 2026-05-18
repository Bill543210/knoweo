import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';

const EDUCATION_LEVELS: { [key: string]: string } = {
  bachelor:          'Licence / Bachelor',
  master:            'Master',
  master_specialized:'Master Spécialisé',
  mba:               'MBA',
  phd:               'Doctorat / PhD',
  other:             'Autre',
};

const BADGE_THRESHOLDS = [
  { label: 'Bronze',  min: 5,   icon: '🥉', color: '#CD7F32' },
  { label: 'Argent',  min: 20,  icon: '🥈', color: '#9CA3AF' },
  { label: 'Or',      min: 50,  icon: '🥇', color: '#F5A623' },
  { label: 'Platine', min: 100, icon: '💎', color: '#6366F1' },
];

const PublicProfile = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [profile, setProfile]               = useState<any>(null);
  const [progress, setProgress]             = useState<any>(null);
  const [domains, setDomains]               = useState<any[]>([]);
  const [relationStatus, setRelationStatus] = useState<'none' | 'friends' | 'sent' | 'received'>('none');
  const [isLoading, setIsLoading]           = useState(true);
  const [actionLoading, setActionLoading]   = useState(false);
  const [notFound, setNotFound]             = useState(false);
  const [activeTab, setActiveTab]           = useState<'profil' | 'progression'>('profil');

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/users/${id}/public`);
        if (!res.data) { setNotFound(true); return; }
        setProfile(res.data);

        // Charge les données en parallèle
        const promises: Promise<any>[] = [
          api.get('/domains'),
        ];

        if (!isOwnProfile) {
          promises.push(api.get(`/friends/status/${id}`));
        }

        if (res.data.isScorePublic || res.data.isProgressPublic) {
          // Charge les stats publiques de l'utilisateur visité
          // Note : pour l'instant on charge ses propres stats — à améliorer
          // quand on aura un endpoint public /users/:id/stats
          promises.push(api.get('/user-progress/stats'));
        }

        const results = await Promise.allSettled(promises);

        if (results[0].status === 'fulfilled') setDomains(results[0].value.data);

        if (!isOwnProfile && results[1]?.status === 'fulfilled') {
          const status = results[1].value.data;
          setRelationStatus(typeof status === 'string' ? status as any : status?.status || 'none');
        }

        if (res.data.isScorePublic || res.data.isProgressPublic) {
          const statsIdx = isOwnProfile ? 1 : 2;
          const statsResult = results[statsIdx];
            if (statsResult?.status === 'fulfilled') {
            setProgress((statsResult as PromiseFulfilledResult<any>).value.data);
            }
        }

      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isOwnProfile]);

  const handleFriendAction = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      if (relationStatus === 'none') {
        await api.post(`/friends/request/${id}`);
        setRelationStatus('sent');
      } else if (relationStatus === 'sent') {
        await api.delete(`/friends/${id}`);
        setRelationStatus('none');
      } else if (relationStatus === 'received') {
        await api.post(`/friends/accept/${id}`);
        setRelationStatus('friends');
      } else if (relationStatus === 'friends') {
        if (window.confirm('Supprimer cet ami ?')) {
          await api.delete(`/friends/${id}`);
          setRelationStatus('none');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getFriendButtonConfig = () => {
    switch (relationStatus) {
      case 'none':     return { label: '+ Ajouter',           bg: colors.primary,  color: 'white'          };
      case 'sent':     return { label: '✓ Demande envoyée',   bg: colors.border,   color: colors.textMuted };
      case 'received': return { label: '✓ Accepter la demande', bg: '#22C55E',     color: 'white'          };
      case 'friends':  return { label: '👥 Amis',             bg: '#DCFCE7',       color: '#166534'        };
    }
  };

  const getMemberSince = () => {
    if (!profile?.createdAt) return '';
    return new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  if (isLoading) return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ color: colors.textMuted }}>Chargement du profil...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <Navigation />
      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px' }}>
        <p style={{ fontSize: '48px' }}>🔍</p>
        <h2 style={{ color: colors.primary, fontSize: '24px', fontWeight: '800', margin: 0 }}>Profil introuvable</h2>
        <p style={{ color: colors.textMuted, margin: 0 }}>Cet utilisateur n'existe pas ou a supprimé son compte.</p>
        <button onClick={() => navigate('/dashboard')}
          style={{ backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );

  const friendBtn = isOwnProfile ? null : getFriendButtonConfig();
  const xpLevel   = Math.floor((progress?.totalXP || 0) / 100) + 1;

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navigation />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '88px 24px 48px', display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

        {/* ── HEADER ── */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '20px' }}>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ width: '80px', height: '80px', borderRadius: radius.full, backgroundColor: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', flexShrink: 0, border: `4px solid ${colors.accent}`, overflow: 'hidden' }}>
                {profile?.avatarUrl
                  ? <img src={`http://localhost:3001${profile.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.primary, margin: 0 }}>
                  {profile?.firstName} {profile?.lastName}
                  {relationStatus === 'friends' && (
                    <span style={{ marginLeft: '8px', fontSize: '13px', color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: radius.full, fontWeight: '600' }}>
                      👥 Ami
                    </span>
                  )}
                </h1>
                {profile?.jobTitle && profile?.company && (
                  <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0 }}>
                    {profile.jobTitle} chez {profile.company}
                  </p>
                )}
                {profile?.lastSchool && !profile?.company && (
                  <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0 }}>
                    {EDUCATION_LEVELS[profile.educationLevel] || ''} · {profile.lastSchool}
                  </p>
                )}
                {(profile?.city || profile?.country) && (
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                    📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0, fontStyle: 'italic' }}>
                  Membre depuis {getMemberSince()}
                </p>

                {/* Badges statut */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' as const }}>
                  {profile?.status === 'student' && (
                    <span style={{ fontSize: '12px', backgroundColor: '#EEF2FF', color: colors.primary, padding: '3px 10px', borderRadius: radius.full, fontWeight: '600' }}>🎓 Étudiant</span>
                  )}
                  {profile?.status === 'professional' && (
                    <span style={{ fontSize: '12px', backgroundColor: '#F0FDF4', color: '#166534', padding: '3px 10px', borderRadius: radius.full, fontWeight: '600' }}>💼 Professionnel</span>
                  )}
                  {profile?.yearsOfExperience > 0 && (
                    <span style={{ fontSize: '12px', backgroundColor: colors.accentLight, color: colors.accent, padding: '3px 10px', borderRadius: radius.full, fontWeight: '600' }}>
                      {profile.yearsOfExperience} an(s) d'expérience
                    </span>
                  )}
                  {profile?.isScorePublic && progress && (
                    <span style={{ fontSize: '12px', backgroundColor: `${colors.accent}20`, color: colors.accent, padding: '3px 10px', borderRadius: radius.full, fontWeight: '700' }}>
                      ⭐ Niv. {xpLevel} · {progress.totalXP?.toLocaleString()} XP
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons actions */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', flexShrink: 0 }}>
              {isOwnProfile ? (
                <button onClick={() => navigate('/profile')}
                  style={{ backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  ✏️ Modifier mon profil
                </button>
              ) : (
                friendBtn && (
                  <button
                    onClick={handleFriendAction}
                    disabled={actionLoading}
                    style={{ backgroundColor: friendBtn.bg, color: friendBtn.color, border: 'none', borderRadius: radius.md, padding: '10px 20px', fontSize: '14px', fontWeight: '700', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                    {actionLoading ? '...' : friendBtn.label}
                  </button>
                )
              )}
              {profile?.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'block', textAlign: 'center' as const, backgroundColor: '#0077B5', color: 'white', borderRadius: radius.md, padding: '10px 20px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                  🔗 Voir LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md, borderLeft: `4px solid ${colors.accent}` }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── ONGLETS ── */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.surface, padding: '6px', borderRadius: radius.lg, boxShadow: shadows.sm }}>
          {[
            { key: 'profil',      label: '👤 Profil' },
            { key: 'progression', label: '📊 Progression' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              style={{ flex: 1, padding: '10px', borderRadius: radius.md, border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.15s', fontFamily: 'inherit', backgroundColor: activeTab === tab.key ? colors.primary : 'transparent', color: activeTab === tab.key ? 'white' : colors.textMuted }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB PROFIL ── */}
        {activeTab === 'profil' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Parcours */}
            <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>🎓 Parcours</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {profile?.lastSchool && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: '0 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>École</p>
                    <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0, fontWeight: '500' }}>{profile.lastSchool}</p>
                  </div>
                )}
                {profile?.educationLevel && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: '0 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Niveau</p>
                    <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{EDUCATION_LEVELS[profile.educationLevel] || profile.educationLevel}</p>
                  </div>
                )}
                {profile?.fieldOfStudy && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: '0 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Spécialisation</p>
                    <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{profile.fieldOfStudy}</p>
                  </div>
                )}
                {!profile?.lastSchool && !profile?.educationLevel && (
                  <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>Non renseigné</p>
                )}
              </div>
            </div>

            {/* Expérience */}
            <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>💼 Expérience</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {profile?.company && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: '0 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Entreprise</p>
                    <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0, fontWeight: '500' }}>{profile.company}</p>
                  </div>
                )}
                {profile?.jobTitle && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: '0 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Poste</p>
                    <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{profile.jobTitle}</p>
                  </div>
                )}
                {profile?.workCountry && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, margin: '0 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Pays</p>
                    <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>📍 {profile.workCountry}</p>
                  </div>
                )}
                {!profile?.company && !profile?.jobTitle && (
                  <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>Non renseigné</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB PROGRESSION ── */}
        {activeTab === 'progression' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>

            {/* Stats globales */}
            {profile?.isScorePublic && progress ? (
              <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0' }}>📊 Statistiques globales</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Niveau',          value: `Niv. ${xpLevel}`,                       color: colors.accent,  icon: '⭐' },
                    { label: 'XP total',         value: (progress.totalXP || 0).toLocaleString(), color: colors.accent,  icon: '🎯' },
                    { label: 'Série actuelle',   value: `${progress.currentStreak || 0}j 🔥`,    color: '#EF4444',      icon: '🔥' },
                    { label: 'Taux de réussite', value: `${progress.correctRate || 0}%`,          color: '#22C55E',      icon: '✅' },
                    { label: 'Questions',         value: progress.questionsAnswered || 0,          color: colors.primary, icon: '❓' },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px', textAlign: 'center' as const }}>
                      <p style={{ fontSize: '22px', fontWeight: '800', color: s.color, margin: '0 0 4px 0' }}>{s.value}</p>
                      <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '32px', boxShadow: shadows.sm, textAlign: 'center' as const }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>🔒</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 8px 0' }}>Statistiques privées</p>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                  {profile?.firstName} a choisi de garder ses statistiques privées.
                </p>
              </div>
            )}

            {/* Badges globaux */}
            <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>🏅 Badges</h2>
              {!profile?.isProgressPublic ? (
                <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>
                  La progression de {profile?.firstName} est privée.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {domains.map(domain => {
                    const badge = BADGE_THRESHOLDS.filter(() => false)[0]; // placeholder — nécessite endpoint public
                    return (
                      <div key={domain.id} style={{ padding: '14px', backgroundColor: colors.background, borderRadius: radius.md, borderLeft: `3px solid ${domain.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '16px' }}>{domain.icon}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: colors.primary }}>{domain.nameFr}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
                          {badge ? `${badge.icon} ${badge.label}` : 'Non commencé'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PublicProfile;