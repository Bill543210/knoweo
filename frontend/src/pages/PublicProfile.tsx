import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';

const PHONE_CODES = [
  { code: 'FR', dial: '+33' }, { code: 'BE', dial: '+32' },
  { code: 'CH', dial: '+41' }, { code: 'LU', dial: '+352' },
  { code: 'CA', dial: '+1' }, { code: 'US', dial: '+1' },
  { code: 'GB', dial: '+44' }, { code: 'DE', dial: '+49' },
  { code: 'MA', dial: '+212' }, { code: 'SN', dial: '+221' },
  { code: 'CI', dial: '+225' }, { code: 'TN', dial: '+216' },
  { code: 'DZ', dial: '+213' }, { code: 'AE', dial: '+971' },
];

const EDUCATION_LEVELS: { [key: string]: string } = {
  bachelor: 'Licence / Bachelor',
  master: 'Master',
  master_specialized: 'Master Spécialisé',
  mba: 'MBA',
  phd: 'Doctorat / PhD',
  other: 'Autre',
};

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteSent, setInviteSent] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/public`);
        if (!res.data) { setNotFound(true); return; }
        setProfile(res.data);
        if (res.data.isProgressPublic || res.data.isScorePublic) {
          try {
            const progressRes = await api.get(`/user-progress/stats`);
            setProgress(progressRes.data);
          } catch {}
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getMemberSince = () => {
    if (!profile?.createdAt) return '';
    return new Date(profile.createdAt).toLocaleDateString('fr-FR', {
      month: 'long', year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
        <Navigation />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: colors.textMuted }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
        <Navigation />
        <div style={{ display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
          <p style={{ fontSize: '48px' }}>🔍</p>
          <h2 style={{ color: colors.primary, fontSize: '24px', fontWeight: '800', margin: 0 }}>Profil introuvable</h2>
          <p style={{ color: colors.textMuted, margin: 0 }}>Cet utilisateur n'existe pas ou a supprimé son compte.</p>
          <button
            style={{ backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
            onClick={() => navigate('/dashboard')}
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navigation />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '88px 24px 48px 24px', display: 'flex', flexDirection: 'column' as 'column', gap: '24px' }}>

        {/* HEADER */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

              {/* AVATAR */}
              <div style={{
                width: '80px', height: '80px', borderRadius: radius.full,
                backgroundColor: colors.primary, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: '800', flexShrink: 0,
                border: `4px solid ${colors.accent}`, overflow: 'hidden',
              }}>
                {profile?.avatarUrl
                  ? <img src={`http://localhost:3001${profile.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' as 'cover' }} />
                  : `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`
                }
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.primary, margin: 0 }}>
                  {profile?.firstName} {profile?.lastName}
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
                  Membre Knoweo depuis {getMemberSince()}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' as 'wrap' }}>
                  {profile?.status === 'student' && (
                    <span style={{ fontSize: '12px', backgroundColor: '#EEF2FF', color: colors.primary, padding: '3px 10px', borderRadius: radius.full, fontWeight: '600' }}>
                      🎓 Étudiant
                    </span>
                  )}
                  {profile?.status === 'professional' && (
                    <span style={{ fontSize: '12px', backgroundColor: '#F0FDF4', color: '#166534', padding: '3px 10px', borderRadius: radius.full, fontWeight: '600' }}>
                      💼 Professionnel
                    </span>
                  )}
                  {profile?.yearsOfExperience > 0 && (
                    <span style={{ fontSize: '12px', backgroundColor: colors.accentLight, color: colors.accent, padding: '3px 10px', borderRadius: radius.full, fontWeight: '600' }}>
                      {profile.yearsOfExperience} an(s) d'expérience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '10px' }}>
              <button
                style={{
                  backgroundColor: inviteSent ? colors.success : colors.primary,
                  color: 'white', border: 'none', borderRadius: radius.md,
                  padding: '10px 20px', fontSize: '14px', fontWeight: '600',
                  cursor: inviteSent ? 'default' : 'pointer', whiteSpace: 'nowrap' as 'nowrap',
                  transition: 'background-color 0.3s',
                }}
                onClick={() => !inviteSent && setInviteSent(true)}
              >
                {inviteSent ? '✅ Invitation envoyée' : '➕ Envoyer une invitation'}
              </button>
              {profile?.linkedinUrl && React.createElement(
  'a',
  {
    href: profile.linkedinUrl,
    target: '_blank',
    rel: 'noreferrer',
    style: {
      display: 'block',
      textAlign: 'center' as 'center',
      backgroundColor: '#0077B5',
      color: 'white',
      borderRadius: radius.md,
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      whiteSpace: 'nowrap' as 'nowrap',
    },
  },
  '🔗 Voir LinkedIn'
)}

            </div>
          </div>

          {/* BIO */}
          {profile?.bio && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md, borderLeft: `4px solid ${colors.accent}` }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                {profile.bio}
              </p>
            </div>
          )}
        </div>

        {/* INFOS DÉTAILLÉES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* PARCOURS */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              🎓 Parcours
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '12px' }}>
              {profile?.lastSchool && (
                <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '2px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' }}>École / Université</p>
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0, fontWeight: '500' }}>{profile.lastSchool}</p>
                </div>
              )}
              {profile?.educationLevel && (
                <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '2px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' }}>Niveau</p>
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{EDUCATION_LEVELS[profile.educationLevel] || profile.educationLevel}</p>
                </div>
              )}
              {profile?.fieldOfStudy && (
                <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '2px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' }}>Spécialisation</p>
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{profile.fieldOfStudy}</p>
                </div>
              )}
              {!profile?.lastSchool && !profile?.educationLevel && (
                <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>Non renseigné</p>
              )}
            </div>
          </div>

          {/* EXPÉRIENCE */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              💼 Expérience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '12px' }}>
              {profile?.company && (
                <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '2px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' }}>Entreprise</p>
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0, fontWeight: '500' }}>{profile.company}</p>
                </div>
              )}
              {profile?.jobTitle && (
                <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '2px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' }}>Poste</p>
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{profile.jobTitle}</p>
                </div>
              )}
              {profile?.workCountry && (
                <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '2px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, margin: 0, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' }}>Pays</p>
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>📍 {profile.workCountry}</p>
                </div>
              )}
              {!profile?.company && !profile?.jobTitle && (
                <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>Non renseigné</p>
              )}
            </div>
          </div>
        </div>

        {/* STATS KNOWEO */}
        {(profile?.isScorePublic || profile?.isProgressPublic) && (
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0' }}>
              📊 Progression Knoweo
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              {profile?.isScorePublic && progress && (
                <>
                  <div style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px', textAlign: 'center' as 'center' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0' }}>{progress.totalXP?.toLocaleString() || 0}</p>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>Points XP</p>
                  </div>
                  <div style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px', textAlign: 'center' as 'center' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: '#EF4444', margin: '0 0 4px 0' }}>{progress.currentStreak || 0} 🔥</p>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>Jours consécutifs</p>
                  </div>
                  <div style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px', textAlign: 'center' as 'center' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: colors.success, margin: '0 0 4px 0' }}>{progress.correctRate || 0}%</p>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>Taux de réussite</p>
                  </div>
                  <div style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px', textAlign: 'center' as 'center' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: '#6366F1', margin: '0 0 4px 0' }}>{progress.battlesWon || 0}</p>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>Battles gagnées</p>
                  </div>
                </>
              )}
            </div>
            {!profile?.isScorePublic && (
              <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>
                Cet utilisateur a choisi de garder son score privé.
              </p>
            )}
          </div>
        )}

        {/* BADGES */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '24px', boxShadow: shadows.sm }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0' }}>
            🏅 Badges obtenus
          </h2>
          <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>
            Les badges seront affichés ici une fois les premiers défis complétés.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;