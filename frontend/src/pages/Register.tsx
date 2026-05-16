import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, shadows, radius } from '../styles';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'Requis';
    if (!lastName.trim()) newErrors.lastName = 'Requis';
    if (!email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide";
    if (!password) newErrors.password = 'Requis';
    else if (password.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (!confirmPassword) newErrors.confirmPassword = 'Requis';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await register(firstName, lastName, email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ global: 'Cet email est déjà utilisé ou une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoText}>Knoweo</span>
            <span style={styles.logoBadge}>Gratuit</span>
          </div>
          <h2 style={styles.leftTitle}>
            Développe ta culture,<br />
            <span style={styles.leftTitleAccent}>un quiz à la fois.</span>
          </h2>
          <p style={styles.leftSubtitle}>
            Finance, data, économie, culture générale... Rejoins des milliers de curieux qui progressent chaque jour sur Knoweo.
          </p>
          <div style={styles.socialProof}>
            <div style={styles.avatarStack}>
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <div key={l} style={{
                  ...styles.miniAvatar,
                  backgroundColor: ['#6366F1', '#F5A623', '#22C55E', '#EF4444'][i],
                  marginLeft: i === 0 ? 0 : '-10px',
                  zIndex: 4 - i,
                }}>
                  {l}
                </div>
              ))}
            </div>
            <p style={styles.socialProofText}>
              <strong style={{ color: 'white' }}>+2 400 membres</strong> actifs ce mois-ci
            </p>
          </div>
          <div style={styles.stats}>
            {[
              { value: '8+', label: 'Domaines de savoir' },
              { value: '1 000+', label: 'Questions & explications' },
              { value: '100%', label: 'Gratuit' },
            ].map(stat => (
              <div key={stat.label} style={styles.statItem}>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Créer un compte</h2>
            <p style={styles.subtitle}>C'est gratuit et ça prend moins d'une minute</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Prénom</label>
                <input
                  style={{ ...styles.input, ...(errors.firstName ? styles.inputError : {}) }}
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && <p style={styles.errorText}>{errors.firstName}</p>}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nom</label>
                <input
                  style={{ ...styles.input, ...(errors.lastName ? styles.inputError : {}) }}
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && <p style={styles.errorText}>{errors.lastName}</p>}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Adresse e-mail</label>
              <input
                style={{ ...styles.inputFull, ...(errors.email ? styles.inputError : {}) }}
                type="email"
                placeholder="jean.dupont@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.passwordWrapper}>
                <input
                  style={{ ...styles.inputFull, ...(errors.password ? styles.inputError : {}), paddingRight: '48px' }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p style={styles.errorText}>{errors.password}</p>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirmer le mot de passe</label>
              <input
                style={{ ...styles.inputFull, ...(errors.confirmPassword ? styles.inputError : {}) }}
                type="password"
                placeholder="Répète ton mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p style={styles.errorText}>{errors.confirmPassword}</p>}
            </div>

            {errors.global && (
              <div style={styles.globalError}>⚠️ {errors.global}</div>
            )}

            <button style={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? 'Création en cours...' : 'Créer mon compte gratuitement →'}
            </button>

            <p style={styles.terms}>
              En créant un compte, tu acceptes nos{' '}
              <span style={styles.termsLink}>Conditions d'utilisation</span>
              {' '}et notre{' '}
              <span style={styles.termsLink}>Politique de confidentialité</span>
            </p>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>déjà membre ?</span>
            <span style={styles.dividerLine} />
          </div>

          <Link to="/login" style={styles.loginBtn}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  left: {
    flex: 1,
    background: `linear-gradient(135deg, ${colors.primary} 0%, #1B3A6B 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  leftContent: {
    maxWidth: '440px',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'white',
  },
  logoBadge: {
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: colors.accent,
    color: colors.primary,
    padding: '4px 10px',
    borderRadius: radius.full,
  },
  leftTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    margin: '0 0 16px 0',
  },
  leftTitleAccent: {
    color: colors.accent,
  },
  leftSubtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: '1.6',
    margin: '0 0 40px 0',
  },
  socialProof: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  avatarStack: {
    display: 'flex',
    alignItems: 'center',
  },
  miniAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: radius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: 'white',
    border: '2px solid #0F2044',
    position: 'relative' as 'relative',
  },
  socialProofText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    margin: 0,
  },
  stats: {
    display: 'flex',
    gap: '32px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: colors.accent,
    margin: 0,
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
  },
  right: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: radius.xl,
    padding: '48px 44px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: shadows.lg,
  },
  cardHeader: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: colors.textMuted,
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '18px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    letterSpacing: '0.3px',
  },
  input: {
    padding: '13px 16px',
    borderRadius: radius.md,
    border: `2px solid ${colors.border}`,
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    backgroundColor: '#FAFBFF',
    fontFamily: 'inherit',
  },
  inputFull: {
    padding: '13px 16px',
    borderRadius: radius.md,
    border: `2px solid ${colors.border}`,
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    backgroundColor: '#FAFBFF',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF8F8',
  },
  passwordWrapper: {
    position: 'relative' as 'relative',
  },
  eyeBtn: {
    position: 'absolute' as 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
  },
  errorText: {
    color: '#EF4444',
    fontSize: '12px',
    margin: '2px 0 0 0',
  },
  globalError: {
    backgroundColor: '#FFF5F5',
    border: '1px solid #FED7D7',
    borderRadius: radius.md,
    padding: '12px 16px',
    color: '#C53030',
    fontSize: '14px',
  },
  button: {
    padding: '15px',
    borderRadius: radius.md,
    border: 'none',
    background: `linear-gradient(135deg, ${colors.primary} 0%, #1B3A6B 100%)`,
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    letterSpacing: '0.3px',
    boxShadow: shadows.md,
  },
  terms: {
    fontSize: '12px',
    color: colors.textMuted,
    textAlign: 'center' as 'center',
    margin: '4px 0 0 0',
    lineHeight: '1.6',
  },
  termsLink: {
    color: colors.primaryLight,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '28px 0 20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: colors.border,
    display: 'block',
  },
  dividerText: {
    fontSize: '13px',
    color: colors.textMuted,
    whiteSpace: 'nowrap' as 'nowrap',
  },
  loginBtn: {
    display: 'block',
    textAlign: 'center' as 'center',
    padding: '14px',
    borderRadius: radius.md,
    border: `2px solid ${colors.border}`,
    color: colors.primary,
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
};

export default Register;