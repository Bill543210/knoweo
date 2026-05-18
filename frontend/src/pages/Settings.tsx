import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { colors, shadows, radius, font } from '../styles';
import api from '../services/api';

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface SettingsForm {
  // Compte
  email:           string;
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
  // Préférences
  language:        string;
  dailyGoal:       number;
  // Notifications
  notifFriendRequest: boolean;
  notifBadge:         boolean;
  notifStreak:        boolean;
  notifComment:       boolean;
}

// ── COMPOSANTS UTILITAIRES ────────────────────────────────────────────────────

const Section = ({
  title, icon, children,
}: {
  title: string; icon: string; children: React.ReactNode;
}) => (
  <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '28px', boxShadow: shadows.sm }}>
    <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{icon}</span> {title}
    </h2>
    {children}
  </div>
);

const Toggle = ({
  value, onChange, disabled = false,
}: {
  value: boolean; onChange: () => void; disabled?: boolean;
}) => (
  <button
    onClick={() => !disabled && onChange()}
    style={{
      width: '48px', height: '26px', borderRadius: '13px', border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      backgroundColor: value ? colors.success : colors.border,
      position: 'relative' as const, transition: 'background-color 0.2s',
      padding: 0, flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute' as const, top: '3px', width: '20px', height: '20px',
      borderRadius: '50%', backgroundColor: 'white',
      transition: 'transform 0.2s', display: 'block',
      transform: value ? 'translateX(25px)' : 'translateX(3px)',
      boxShadow: shadows.sm,
    }} />
  </button>
);

const SettingRow = ({
  label, desc, children,
}: {
  label: string; desc?: string; children: React.ReactNode;
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
    <div>
      <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 2px 0' }}>{label}</p>
      {desc && <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{desc}</p>}
    </div>
    {children}
  </div>
);

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

const Settings = () => {
  const navigate          = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const [form, setForm]               = useState<SettingsForm>({
    email: '', currentPassword: '', newPassword: '', confirmPassword: '',
    language: 'fr', dailyGoal: 10,
    notifFriendRequest: true, notifBadge: true, notifStreak: true, notifComment: true,
  });

  const [activeSection, setActiveSection] = useState<'compte' | 'preferences' | 'notifications' | 'donnees'>('compte');
  const [isSaving, setIsSaving]           = useState(false);
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm]   = useState(false);
  const [deleteInput, setDeleteInput]     = useState('');
  const [pwdError, setPwdError]           = useState('');

  // ── Chargement ─────────────────────────────────────────────
  useEffect(() => {
    api.get('/users/me').then(res => {
      const u = res.data;
      setForm(prev => ({
        ...prev,
        email:              u.email              || '',
        language:           u.language           || 'fr',
        dailyGoal:          u.dailyGoal          ?? 10,
        notifFriendRequest: u.notifFriendRequest ?? true,
        notifBadge:         u.notifBadge         ?? true,
        notifStreak:        u.notifStreak        ?? true,
        notifComment:       u.notifComment       ?? true,
      }));
    });
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Sauvegarde email ──────────────────────────────────────
  const handleSaveEmail = async () => {
    if (!form.email.trim()) return;
    setIsSaving(true);
    try {
      await api.put('/users/me', { email: form.email });
      await refreshUser();
      showToast('Email mis à jour avec succès.');
    } catch {
      showToast('Cet email est déjà utilisé.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Changement mot de passe ───────────────────────────────
  const handleChangePassword = async () => {
    setPwdError('');
    if (form.newPassword.length < 8) {
      setPwdError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setPwdError('Les mots de passe ne correspondent pas.');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      showToast('Mot de passe modifié avec succès.');
    } catch {
      showToast('Mot de passe actuel incorrect.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Sauvegarde préférences ────────────────────────────────
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await api.put('/users/me', {
        language:  form.language,
        dailyGoal: form.dailyGoal,
      });
      await refreshUser();
      showToast('Préférences sauvegardées.');
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Sauvegarde notifications ──────────────────────────────
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await api.put('/users/me', {
        notifFriendRequest: form.notifFriendRequest,
        notifBadge:         form.notifBadge,
        notifStreak:        form.notifStreak,
        notifComment:       form.notifComment,
      });
      showToast('Préférences de notifications sauvegardées.');
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Reset progression ─────────────────────────────────────
  const handleResetProgress = async () => {
    try {
      await api.post('/user-progress/reset');
      showToast('Progression réinitialisée.');
      setShowResetConfirm(false);
    } catch {
      showToast('Erreur lors de la réinitialisation.', 'error');
    }
  };

  // ── Suppression compte ────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.email) return;
    try {
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px', borderRadius: radius.md,
    border: `2px solid ${colors.border}`, fontSize: '14px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
    backgroundColor: '#FAFBFF', fontFamily: font.family, color: colors.textPrimary,
  };

  const sidebarItems = [
    { key: 'compte',        label: 'Compte',         icon: '🔐' },
    { key: 'preferences',   label: 'Préférences',    icon: '⚙️' },
    { key: 'notifications', label: 'Notifications',  icon: '🔔' },
    { key: 'donnees',       label: 'Mes données',    icon: '🗃️' },
  ] as const;

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
      <Navigation />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed' as const, top: '80px', right: '24px', backgroundColor: toast.type === 'success' ? colors.success : '#EF4444', borderRadius: radius.lg, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, boxShadow: shadows.lg }}>
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>{toast.msg}</p>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '88px 24px 64px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width: '220px', flexShrink: 0, backgroundColor: colors.surface, borderRadius: radius.xl, padding: '8px', boxShadow: shadows.sm, position: 'sticky' as const, top: '88px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '1px', padding: '12px 12px 6px', margin: 0 }}>
            Paramètres
          </p>
          {sidebarItems.map(item => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', borderRadius: radius.md, border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeSection === item.key ? '700' : '500', backgroundColor: activeSection === item.key ? '#EEF2FF' : 'transparent', color: activeSection === item.key ? colors.primary : colors.textSecondary, transition: 'all 0.15s', fontFamily: font.family, textAlign: 'left' as const }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* ── CONTENU ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>

          {/* ── COMPTE ── */}
          {activeSection === 'compte' && (
            <>
              <Section title="Adresse email" icon="📧">
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      Email actuel
                    </label>
                    <input style={inputStyle} type="email" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <button onClick={handleSaveEmail} disabled={isSaving}
                    style={{ alignSelf: 'flex-start' as const, padding: '10px 20px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                    {isSaving ? 'Sauvegarde...' : 'Mettre à jour l\'email'}
                  </button>
                </div>
              </Section>

              <Section title="Mot de passe" icon="🔑">
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  {[
                    { label: 'Mot de passe actuel', key: 'currentPassword' },
                    { label: 'Nouveau mot de passe',  key: 'newPassword' },
                    { label: 'Confirmer le nouveau',  key: 'confirmPassword' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                        {f.label}
                      </label>
                      <input style={inputStyle} type="password"
                        value={(form as any)[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  {pwdError && <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>⚠️ {pwdError}</p>}
                  <button onClick={handleChangePassword} disabled={isSaving || !form.currentPassword || !form.newPassword}
                    style={{ alignSelf: 'flex-start' as const, padding: '10px 20px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family, opacity: !form.currentPassword || !form.newPassword ? 0.5 : 1 }}>
                    Changer le mot de passe
                  </button>
                </div>
              </Section>
            </>
          )}

          {/* ── PRÉFÉRENCES ── */}
          {activeSection === 'preferences' && (
            <Section title="Préférences d'apprentissage" icon="⚙️">
              <div>
                {/* Langue */}
                <SettingRow label="Langue de l'application" desc="Langue des questions et de l'interface">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['fr', 'en'].map(lang => (
                      <button key={lang} onClick={() => setForm(p => ({ ...p, language: lang }))}
                        style={{ padding: '6px 14px', borderRadius: radius.full, border: `2px solid ${form.language === lang ? colors.primary : colors.border}`, backgroundColor: form.language === lang ? colors.primary : 'white', color: form.language === lang ? 'white' : colors.textSecondary, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                        {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                {/* Objectif quotidien */}
                <SettingRow label="Objectif quotidien" desc="Nombre de questions à répondre chaque jour">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[5, 10, 20, 30].map(n => (
                      <button key={n} onClick={() => setForm(p => ({ ...p, dailyGoal: n }))}
                        style={{ padding: '6px 14px', borderRadius: radius.full, border: `2px solid ${form.dailyGoal === n ? colors.accent : colors.border}`, backgroundColor: form.dailyGoal === n ? colors.accent : 'white', color: form.dailyGoal === n ? colors.primary : colors.textSecondary, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                {/* Description objectif */}
                <div style={{ padding: '12px 14px', backgroundColor: colors.accentLight, borderRadius: radius.md, marginTop: '4px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
                    🎯 Objectif actuel : <strong>{form.dailyGoal} questions/jour</strong> —{' '}
                    {form.dailyGoal <= 5 ? 'Parfait pour commencer, ~5 min/jour.'
                      : form.dailyGoal <= 10 ? 'Un bon équilibre, ~10 min/jour.'
                      : form.dailyGoal <= 20 ? 'Entraînement sérieux, ~20 min/jour.'
                      : 'Mode intensif, ~30 min/jour.'}
                  </p>
                </div>

                <div style={{ borderTop: 'none' }}>
                  <button onClick={handleSavePreferences} disabled={isSaving}
                    style={{ padding: '12px 24px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <Section title="Préférences de notifications" icon="🔔">
              <div>
                {[
                  { key: 'notifFriendRequest', label: 'Demandes d\'ami',    desc: 'Quand quelqu\'un t\'envoie une demande d\'ami' },
                  { key: 'notifBadge',         label: 'Nouveaux badges',    desc: 'Quand tu obtiens un nouveau badge ou niveau' },
                  { key: 'notifStreak',         label: 'Streak en danger',  desc: 'Rappel quand ta série de jours est sur le point de s\'interrompre' },
                  { key: 'notifComment',        label: 'Commentaires',      desc: 'Quand quelqu\'un répond à ton commentaire' },
                ].map((item, i, arr) => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 2px 0' }}>{item.label}</p>
                      <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{item.desc}</p>
                    </div>
                    <Toggle
                      value={(form as any)[item.key]}
                      onChange={() => setForm(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}
                    />
                  </div>
                ))}
                <div style={{ marginTop: '20px' }}>
                  <button onClick={handleSaveNotifications} disabled={isSaving}
                    style={{ padding: '12px 24px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ── DONNÉES ── */}
          {activeSection === 'donnees' && (
            <>
              {/* Abonnement */}
              <Section title="Abonnement" icon="💎">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 4px 0' }}>Plan Gratuit</p>
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Accès à tous les domaines Finance disponibles</p>
                  </div>
                  <div style={{ padding: '8px 16px', backgroundColor: colors.border, borderRadius: radius.md }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: colors.textMuted, margin: 0 }}>Pro — Bientôt</p>
                  </div>
                </div>
              </Section>

              {/* Export */}
              <Section title="Exporter mes données" icon="📤">
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 16px 0', lineHeight: '1.6' }}>
                  Conformément au RGPD, tu peux télécharger l'ensemble de tes données personnelles stockées sur Knoweo.
                </p>
                <button
                  onClick={() => showToast('Export en cours de développement — disponible bientôt.')}
                  style={{ padding: '10px 20px', backgroundColor: colors.background, color: colors.primary, border: `2px solid ${colors.border}`, borderRadius: radius.md, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: font.family }}>
                  📥 Télécharger mes données
                </button>
              </Section>

              {/* Reset progression */}
              <Section title="Réinitialiser ma progression" icon="🔄">
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 16px 0', lineHeight: '1.6' }}>
                  Remet à zéro ton XP, tes streaks et ton historique de questions. Ton profil et tes amis ne sont pas affectés.
                </p>
                {!showResetConfirm ? (
                  <button onClick={() => setShowResetConfirm(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#FEF3C7', color: '#92400E', border: `2px solid #F59E0B`, borderRadius: radius.md, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: font.family }}>
                    🔄 Réinitialiser ma progression
                  </button>
                ) : (
                  <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: radius.md, border: `1px solid #F59E0B` }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', margin: '0 0 12px 0' }}>
                      ⚠️ Cette action est irréversible. Es-tu sûr ?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleResetProgress}
                        style={{ padding: '8px 16px', backgroundColor: '#F59E0B', color: 'white', border: 'none', borderRadius: radius.md, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                        Oui, réinitialiser
                      </button>
                      <button onClick={() => setShowResetConfirm(false)}
                        style={{ padding: '8px 16px', backgroundColor: 'white', color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', cursor: 'pointer', fontFamily: font.family }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </Section>

              {/* Suppression compte */}
              <Section title="Supprimer mon compte" icon="🗑️">
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 16px 0', lineHeight: '1.6' }}>
                  La suppression est définitive. Toutes tes données seront effacées et ne pourront pas être récupérées.
                </p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#FEE2E2', color: '#991B1B', border: `2px solid #EF4444`, borderRadius: radius.md, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: font.family }}>
                    🗑️ Supprimer mon compte
                  </button>
                ) : (
                  <div style={{ padding: '20px', backgroundColor: '#FEE2E2', borderRadius: radius.md, border: `1px solid #EF4444` }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#991B1B', margin: '0 0 8px 0' }}>
                      ⚠️ Tape ton email pour confirmer la suppression
                    </p>
                    <p style={{ fontSize: '12px', color: '#991B1B', margin: '0 0 12px 0' }}>
                      Email attendu : <strong>{user?.email}</strong>
                    </p>
                    <input
                      style={{ ...inputStyle, borderColor: '#EF4444', marginBottom: '12px' }}
                      placeholder="Tape ton email ici..."
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteInput !== user?.email}
                        style={{ padding: '8px 16px', backgroundColor: deleteInput === user?.email ? '#EF4444' : colors.border, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '13px', fontWeight: '700', cursor: deleteInput === user?.email ? 'pointer' : 'not-allowed', fontFamily: font.family }}>
                        Supprimer définitivement
                      </button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                        style={{ padding: '8px 16px', backgroundColor: 'white', color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', cursor: 'pointer', fontFamily: font.family }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </Section>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;