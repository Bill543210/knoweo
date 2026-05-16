import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF'];
const EDUCATION_LEVELS = [
  { value: 'bachelor', label: 'Licence / Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'master_specialized', label: 'Master Spécialisé' },
  { value: 'mba', label: 'MBA' },
  { value: 'phd', label: 'Doctorat / PhD' },
  { value: 'other', label: 'Autre' },
];
const COUNTRIES = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne',
  'Andorre', 'Angola', 'Antigua-et-Barbuda', 'Arabie Saoudite', 'Argentine',
  'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
  'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan',
  'Biélorussie', 'Birmanie', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana',
  'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi', 'Cambodge',
  'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre', 'Colombie',
  'Comores', 'Congo', 'Corée du Nord', 'Corée du Sud', 'Costa Rica',
  'Côte d\'Ivoire', 'Croatie', 'Cuba', 'Danemark', 'Djibouti', 'Dominique',
  'Égypte', 'Émirats Arabes Unis', 'Équateur', 'Érythrée', 'Espagne',
  'Estonie', 'Eswatini', 'États-Unis', 'Éthiopie', 'Fidji', 'Finlande',
  'France', 'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade',
  'Guatemala', 'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Guyana',
  'Haïti', 'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak', 'Iran',
  'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie',
  'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Kosovo', 'Koweït',
  'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein',
  'Lituanie', 'Luxembourg', 'Macédoine du Nord', 'Madagascar', 'Malaisie',
  'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Marshall', 'Maurice',
  'Mauritanie', 'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie',
  'Monténégro', 'Mozambique', 'Namibie', 'Nauru', 'Népal', 'Nicaragua',
  'Niger', 'Nigéria', 'Norvège', 'Nouvelle-Zélande', 'Oman', 'Ouganda',
  'Ouzbékistan', 'Pakistan', 'Palaos', 'Palestine', 'Panama',
  'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines',
  'Pologne', 'Portugal', 'Qatar', 'République centrafricaine',
  'République démocratique du Congo', 'République dominicaine',
  'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
  'Saint-Kitts-et-Nevis', 'Saint-Marin', 'Saint-Vincent-et-les-Grenadines',
  'Sainte-Lucie', 'Salvador', 'Samoa', 'São Tomé-et-Príncipe', 'Sénégal',
  'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie',
  'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse',
  'Suriname', 'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande',
  'Timor oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie',
  'Turkménistan', 'Turquie', 'Tuvalu', 'Ukraine', 'Uruguay', 'Vanuatu',
  'Vatican', 'Venezuela', 'Viêt Nam', 'Yémen', 'Zambie', 'Zimbabwe',
];

const PHONE_CODES = [
  { code: 'FR', dial: '+33', flag: '🇫🇷', label: 'France (+33)' },
  { code: 'BE', dial: '+32', flag: '🇧🇪', label: 'Belgique (+32)' },
  { code: 'CH', dial: '+41', flag: '🇨🇭', label: 'Suisse (+41)' },
  { code: 'LU', dial: '+352', flag: '🇱🇺', label: 'Luxembourg (+352)' },
  { code: 'CA', dial: '+1', flag: '🇨🇦', label: 'Canada (+1)' },
  { code: 'US', dial: '+1', flag: '🇺🇸', label: 'États-Unis (+1)' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', label: 'Royaume-Uni (+44)' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', label: 'Allemagne (+49)' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', label: 'Espagne (+34)' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', label: 'Italie (+39)' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', label: 'Portugal (+351)' },
  { code: 'NL', dial: '+31', flag: '🇳🇱', label: 'Pays-Bas (+31)' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', label: 'Maroc (+212)' },
  { code: 'SN', dial: '+221', flag: '🇸🇳', label: 'Sénégal (+221)' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', label: 'Côte d\'Ivoire (+225)' },
  { code: 'CM', dial: '+237', flag: '🇨🇲', label: 'Cameroun (+237)' },
  { code: 'TN', dial: '+216', flag: '🇹🇳', label: 'Tunisie (+216)' },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', label: 'Algérie (+213)' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', label: 'Émirats (+971)' },
  { code: 'JP', dial: '+81', flag: '🇯🇵', label: 'Japon (+81)' },
  { code: 'CN', dial: '+86', flag: '🇨🇳', label: 'Chine (+86)' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', label: 'Inde (+91)' },
  { code: 'BR', dial: '+55', flag: '🇧🇷', label: 'Brésil (+55)' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', label: 'Australie (+61)' },
];

const PHONE_REGEX: { [key: string]: { regex: RegExp; format: string } } = {
  FR:  { regex: /^[0-9]{9}$/,          format: '6 12 34 56 78 (9 chiffres sans le 0)' },
  BE:  { regex: /^[0-9]{8,9}$/,        format: '12 34 56 78 (8-9 chiffres)' },
  CH:  { regex: /^[0-9]{9}$/,          format: '78 123 45 67 (9 chiffres)' },
  LU:  { regex: /^[0-9]{6,9}$/,        format: '621 123 456 (6-9 chiffres)' },
  CA:  { regex: /^[0-9]{10}$/,         format: '416 123 4567 (10 chiffres)' },
  US:  { regex: /^[0-9]{10}$/,         format: '212 123 4567 (10 chiffres)' },
  GB:  { regex: /^[0-9]{10}$/,         format: '7911 123456 (10 chiffres)' },
  DE:  { regex: /^[0-9]{10,11}$/,      format: '151 12345678 (10-11 chiffres)' },
  ES:  { regex: /^[0-9]{9}$/,          format: '612 345 678 (9 chiffres)' },
  IT:  { regex: /^[0-9]{9,10}$/,       format: '312 345 6789 (9-10 chiffres)' },
  PT:  { regex: /^[0-9]{9}$/,          format: '912 345 678 (9 chiffres)' },
  NL:  { regex: /^[0-9]{9}$/,          format: '612 345 678 (9 chiffres)' },
  MA:  { regex: /^[0-9]{9}$/,          format: '612 345 678 (9 chiffres)' },
  SN:  { regex: /^[0-9]{9}$/,          format: '77 123 45 67 (9 chiffres)' },
  CI:  { regex: /^[0-9]{8}$/,          format: '07 12 34 56 (8 chiffres)' },
  CM:  { regex: /^[0-9]{9}$/,          format: '677 123 456 (9 chiffres)' },
  TN:  { regex: /^[0-9]{8}$/,          format: '20 123 456 (8 chiffres)' },
  DZ:  { regex: /^[0-9]{9}$/,          format: '551 234 567 (9 chiffres)' },
  AE:  { regex: /^[0-9]{9}$/,          format: '50 123 4567 (9 chiffres)' },
  JP:  { regex: /^[0-9]{10,11}$/,      format: '90 1234 5678 (10-11 chiffres)' },
  CN:  { regex: /^[0-9]{11}$/,         format: '131 2345 6789 (11 chiffres)' },
  IN:  { regex: /^[0-9]{10}$/,         format: '98765 43210 (10 chiffres)' },
  BR:  { regex: /^[0-9]{10,11}$/,      format: '11 91234 5678 (10-11 chiffres)' },
  AU:  { regex: /^[0-9]{9}$/,          format: '412 345 678 (9 chiffres)' },
};

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'privacy'>('personal');
  const [form, setForm] = useState<any>({
    firstName: '',
    lastName: '',
    linkedinUrl: '',
    language: 'fr',
    isScorePublic: false,
    isProgressPublic: false,
    dateOfBirth: '',
    bio: '',
    city: '',
    country: 'France',
    status: 'student',
    lastSchool: '',
    educationLevel: 'master',
    fieldOfStudy: '',
    company: '',
    jobTitle: '',
    phoneNumber: '',
    phoneCountryCode: 'FR',
    yearsOfExperience: 0,
    salary: '',
    salaryCurrency: 'EUR',
    workCountry: 'France',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          linkedinUrl: res.data.linkedinUrl || '',
          language: res.data.language || 'fr',
          isScorePublic: res.data.isScorePublic || false,
          isProgressPublic: res.data.isProgressPublic || false,
          dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '',
          bio: res.data.bio || '',
          phoneNumber: res.data.phoneNumber || '',
          phoneCountryCode: res.data.phoneCountryCode || 'FR',
          city: res.data.city || '',
          country: res.data.country || 'France',
          status: res.data.status || 'student',
          lastSchool: res.data.lastSchool || '',
          educationLevel: res.data.educationLevel || 'master',
          fieldOfStudy: res.data.fieldOfStudy || '',
          company: res.data.company || '',
          jobTitle: res.data.jobTitle || '',
          yearsOfExperience: res.data.yearsOfExperience || 0,
          salary: res.data.salary || '',
          salaryCurrency: res.data.salaryCurrency || 'EUR',
          workCountry: res.data.workCountry || 'France',
        });
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await api.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const res = await api.put('/users/me', form);
      setProfile(res.data);
      setIsEditing(false);
      setAvatarFile(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur mise à jour:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      linkedinUrl: profile?.linkedinUrl || '',
      language: profile?.language || 'fr',
      isScorePublic: profile?.isScorePublic || false,
      isProgressPublic: profile?.isProgressPublic || false,
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      bio: profile?.bio || '',
      city: profile?.city || '',
      phoneNumber: profile?.phoneNumber || '',
      phoneCountryCode: profile?.phoneCountryCode || 'FR',
      country: profile?.country || 'France',
      status: profile?.status || 'student',
      lastSchool: profile?.lastSchool || '',
      educationLevel: profile?.educationLevel || 'master',
      fieldOfStudy: profile?.fieldOfStudy || '',
      company: profile?.company || '',
      jobTitle: profile?.jobTitle || '',
      yearsOfExperience: profile?.yearsOfExperience || 0,
      salary: profile?.salary || '',
      salaryCurrency: profile?.salaryCurrency || 'EUR',
      workCountry: profile?.workCountry || 'France',
    });
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const getMemberSince = () => {
    if (!profile?.createdAt) return '';
    return new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getCompletionScore = () => {
    const fields = [
      form.bio, form.city, form.dateOfBirth, form.lastSchool,
      form.fieldOfStudy, form.linkedinUrl,
      form.status === 'professional' ? form.company : form.lastSchool,
    ];
    const filled = fields.filter(f => f && f.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = getCompletionScore();

  const inputStyle = {
    padding: '11px 14px',
    borderRadius: radius.md,
    border: `2px solid ${colors.border}`,
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    backgroundColor: '#FAFBFF',
    fontFamily: 'inherit',
    color: colors.textPrimary,
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as 'none',
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '6px',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600' as '600',
    color: colors.textMuted,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle = {
    fontSize: '15px',
    color: colors.textPrimary,
    margin: 0,
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

  const validatePhone = (number: string, countryCode: string) => {
  if (!number || number.trim() === '') {
    setPhoneError('');
    return;
  }
  const cleaned = number.replace(/[\s\-\.\(\)]/g, '');
  const rule = PHONE_REGEX[countryCode];
  if (rule && !rule.regex.test(cleaned)) {
    setPhoneError(`Format attendu : ${rule.format}`);
  } else {
    setPhoneError('');
  }
};

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navigation />

      {saveSuccess && (
        <div style={{ position: 'fixed' as 'fixed', top: '80px', right: '24px', backgroundColor: colors.success, borderRadius: radius.lg, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, boxShadow: shadows.lg }}>
          <span>✅</span>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>Profil mis à jour !</p>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '88px 24px 80px 24px', display: 'flex', flexDirection: 'column' as 'column', gap: '24px' }}>

        {/* HEADER */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as 'wrap', gap: '20px' }}>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

              {/* AVATAR */}
              {isEditing ? (
                <div
                  style={{
                    width: '100px', height: '100px', borderRadius: radius.full,
                    border: `3px dashed ${isDragging ? colors.accent : colors.border}`,
                    backgroundColor: isDragging ? colors.accentLight : '#FAFBFF',
                    display: 'flex', flexDirection: 'column' as 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                    overflow: 'hidden', position: 'relative' as 'relative',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('avatarInput')?.click()}
                >
                  {avatarPreview || profile?.avatarUrl ? (
                    <img
                      src={avatarPreview || `http://localhost:3001${profile.avatarUrl}`}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' as 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' as 'center', padding: '8px' }}>
                      <p style={{ fontSize: '24px', margin: '0 0 4px 0' }}>📷</p>
                      <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0, lineHeight: '1.3' }}>
                        {isDragging ? 'Dépose ici' : 'Drag & drop ou clic'}
                      </p>
                    </div>
                  )}
                  <input
                    id="avatarInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100px', height: '100px', borderRadius: radius.full,
                  backgroundColor: colors.primary, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: '800', flexShrink: 0,
                  border: `4px solid ${colors.accent}`, overflow: 'hidden',
                }}>
                  {profile?.avatarUrl
                    ? <img src={`http://localhost:3001${profile.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' as 'cover' }} />
                    : `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`
                  }
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '6px' }}>
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
                    {profile.lastSchool}
                  </p>
                )}
                {profile?.city && (
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                    📍 {profile.city}, {profile.country}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0, fontStyle: 'italic' }}>
                  Membre depuis {getMemberSince()}
                </p>

                {/* COMPLETION BAR */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: colors.textMuted }}>Profil complété</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: completion >= 80 ? colors.success : colors.accent }}>{completion}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.background, borderRadius: radius.full, width: '200px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: radius.full,
                      backgroundColor: completion >= 80 ? colors.success : colors.accent,
                      width: `${completion}%`, transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              style={{
                backgroundColor: isEditing ? 'transparent' : colors.primary,
                color: isEditing ? colors.textMuted : 'white',
                border: isEditing ? `2px solid ${colors.border}` : 'none',
                borderRadius: radius.md, padding: '10px 20px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}
              onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
            >
              {isEditing ? '✕ Annuler' : '✏️ Modifier mon profil'}
            </button>
          </div>

          {profile?.bio && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md, borderLeft: `4px solid ${colors.accent}` }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.surface, padding: '6px', borderRadius: radius.lg, boxShadow: shadows.sm }}>
          {[
            { key: 'personal', label: '👤 Informations', },
            { key: 'professional', label: form.status === 'student' ? '🎓 Parcours' : '💼 Carrière' },
            { key: 'privacy', label: '🔒 Confidentialité' },
          ].map(tab => (
            <button
              key={tab.key}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: radius.md,
                border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
                color: activeTab === tab.key ? 'white' : colors.textMuted,
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>

          {/* PERSONAL TAB */}
          {activeTab === 'personal' && (
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Prénom</label>
                  {isEditing
                    ? <input style={inputStyle} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    : <p style={valueStyle}>{profile?.firstName || '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nom</label>
                  {isEditing
                    ? <input style={inputStyle} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                    : <p style={valueStyle}>{profile?.lastName || '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Date de naissance</label>
                  {isEditing
                    ? <input type="date" style={inputStyle} value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                    : <p style={valueStyle}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('fr-FR') : '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Statut</label>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[{ v: 'student', l: '🎓 Étudiant' }, { v: 'professional', l: '💼 Professionnel' }].map(s => (
                        <button key={s.v} style={{
                          flex: 1, padding: '10px', borderRadius: radius.md, cursor: 'pointer',
                          border: `2px solid ${form.status === s.v ? colors.primary : colors.border}`,
                          backgroundColor: form.status === s.v ? '#EEF2FF' : 'white',
                          color: form.status === s.v ? colors.primary : colors.textPrimary,
                          fontWeight: form.status === s.v ? '700' : '500', fontSize: '13px',
                        }} onClick={() => setForm({ ...form, status: s.v })}>
                          {s.l}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={valueStyle}>{profile?.status === 'professional' ? '💼 Professionnel' : '🎓 Étudiant'}</p>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Ville</label>
                  {isEditing
                    ? <input style={inputStyle} placeholder="Paris" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    : <p style={valueStyle}>{profile?.city || '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Pays</label>
                  {isEditing ? (
                    <select style={selectStyle} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <p style={valueStyle}>{profile?.country || '—'}</p>
                  )}
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Bio / Description</label>
                {isEditing ? (
                  <textarea
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as 'vertical' }}
                    placeholder="Parle de toi, de tes ambitions, de tes centres d'intérêt..."
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    maxLength={1000}
                  />
                ) : (
                  <p style={{ ...valueStyle, lineHeight: '1.6' }}>{profile?.bio || '—'}</p>
                )}
                {isEditing && <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{form.bio.length}/1000 caractères</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Profil LinkedIn</label>
                {isEditing
                  ? <input style={inputStyle} placeholder="https://linkedin.com/in/ton-profil" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} />
                  : <p style={valueStyle}>{profile?.linkedinUrl || '—'}</p>}
              </div>

<div style={fieldStyle}>
  <label style={labelStyle}>Numéro de téléphone</label>
  {isEditing ? (
    <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          style={{ ...selectStyle, width: '160px', flex: 'none' }}
          value={form.phoneCountryCode}
          onChange={e => {
            setForm({ ...form, phoneCountryCode: e.target.value });
            validatePhone(form.phoneNumber, e.target.value);
          }}
        >
          {PHONE_CODES.map(p => (
            <option key={p.code} value={p.code}>
              {p.flag} {p.dial}
            </option>
          ))}
        </select>
        <input
          style={{
            ...inputStyle,
            flex: 1,
            borderColor: phoneError ? '#EF4444' : colors.border,
            backgroundColor: phoneError ? '#FFF8F8' : '#FAFBFF',
          }}
          type="tel"
          placeholder={PHONE_REGEX[form.phoneCountryCode]?.format || 'Numéro de téléphone'}
          value={form.phoneNumber}
          onChange={e => {
            const cleaned = e.target.value.replace(/[^0-9\s\-\.\(\)\+]/g, '');
            setForm({ ...form, phoneNumber: cleaned });
            validatePhone(cleaned, form.phoneCountryCode);
          }}
        />
      </div>
      {phoneError && (
        <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>
          ⚠️ {phoneError}
        </p>
      )}
      {!phoneError && form.phoneNumber && (
        <p style={{ fontSize: '12px', color: colors.success, margin: 0 }}>
          ✅ Format valide
        </p>
      )}
      <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
        Saisir sans l'indicatif pays — chiffres uniquement, espaces autorisés
      </p>
    </div>
  ) : (
    <p style={valueStyle}>
      {profile?.phoneNumber
        ? `${PHONE_CODES.find(p => p.code === profile.phoneCountryCode)?.dial || ''} ${profile.phoneNumber}`
        : '—'
      }
    </p>
  )}
</div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Langue de l'application</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['fr', 'en'].map(lang => (
                      <button key={lang} style={{
                        flex: 1, padding: '10px', borderRadius: radius.md, cursor: 'pointer',
                        border: `2px solid ${form.language === lang ? colors.primary : colors.border}`,
                        backgroundColor: form.language === lang ? '#EEF2FF' : 'white',
                        color: form.language === lang ? colors.primary : colors.textPrimary,
                        fontWeight: form.language === lang ? '700' : '500', fontSize: '14px',
                      }} onClick={() => setForm({ ...form, language: lang })}>
                        {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={valueStyle}>{profile?.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</p>
                )}
              </div>
            </div>
          )}

          {/* PROFESSIONAL TAB */}
          {activeTab === 'professional' && (
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Dernière école / Université</label>
                  {isEditing
  ? <AutocompleteInput
      value={form.lastSchool}
      onChange={val => setForm({ ...form, lastSchool: val })}
      endpoint="schools"
      placeholder="HEC Paris, Sciences Po..."
    />
  : <p style={valueStyle}>{profile?.lastSchool || '—'}</p>
}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Niveau d'études</label>
                  {isEditing ? (
                    <select style={selectStyle} value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })}>
                      {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  ) : (
                    <p style={valueStyle}>{EDUCATION_LEVELS.find(e => e.value === profile?.educationLevel)?.label || '—'}</p>
                  )}
                </div>
                <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Domaine d'études / Spécialisation</label>
                  {isEditing
                    ? <input style={inputStyle} placeholder="Finance, Droit des affaires, Ingénierie..." value={form.fieldOfStudy} onChange={e => setForm({ ...form, fieldOfStudy: e.target.value })} />
                    : <p style={valueStyle}>{profile?.fieldOfStudy || '—'}</p>}
                </div>
              </div>

              {form.status === 'professional' && (
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0' }}>💼 Expérience professionnelle</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Entreprise actuelle</label>
                     {isEditing
  ? <AutocompleteInput
      value={form.company}
      onChange={val => setForm({ ...form, company: val })}
      endpoint="companies"
      placeholder="Goldman Sachs, LVMH..."
    />
  : <p style={valueStyle}>{profile?.company || '—'}</p>
}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Fonction / Poste</label>
                      {isEditing
                        ? <input style={inputStyle} placeholder="Analyste M&A, Associate..." value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
                        : <p style={valueStyle}>{profile?.jobTitle || '—'}</p>}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Années d'expérience</label>
                      {isEditing
                        ? <input type="number" style={inputStyle} min="0" max="50" value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: parseInt(e.target.value) })} />
                        : <p style={valueStyle}>{profile?.yearsOfExperience ? `${profile.yearsOfExperience} an(s)` : '—'}</p>}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Pays de travail</label>
                      {isEditing ? (
                        <select style={selectStyle} value={form.workCountry} onChange={e => setForm({ ...form, workCountry: e.target.value })}>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <p style={valueStyle}>{profile?.workCountry || '—'}</p>
                      )}
                    </div>
                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Salaire annuel brut (optionnel)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="number"
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="65000"
                            value={form.salary}
                            onChange={e => setForm({ ...form, salary: e.target.value })}
                          />
                          <select
                            style={{ ...selectStyle, width: '100px', flex: 'none' }}
                            value={form.salaryCurrency}
                            onChange={e => setForm({ ...form, salaryCurrency: e.target.value })}
                          >
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      ) : (
                        <p style={valueStyle}>
                          {profile?.salary ? `${parseInt(profile.salary).toLocaleString()} ${profile.salaryCurrency}` : '—'}
                        </p>
                      )}
                      {isEditing && <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>Cette information est strictement privée et ne sera jamais partagée.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '20px' }}>
              <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, lineHeight: '1.6' }}>
                Choisis ce que tes amis peuvent voir sur ton profil public Knoweo.
              </p>
              {[
                { key: 'isScorePublic', label: 'Score XP visible', desc: 'Tes points totaux seront affichés sur ton profil public' },
                { key: 'isProgressPublic', label: 'Progression visible', desc: 'Ta progression par domaine sera visible par tes amis' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 4px 0' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{item.desc}</p>
                  </div>
                  <button
                    style={{
                      width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                      cursor: isEditing ? 'pointer' : 'default',
                      backgroundColor: form[item.key] ? colors.success : colors.border,
                      position: 'relative' as 'relative', transition: 'background-color 0.2s', padding: 0, flexShrink: 0,
                    }}
                    onClick={() => { if (isEditing) setForm({ ...form, [item.key]: !form[item.key] }); }}
                  >
                    <span style={{
                      position: 'absolute' as 'absolute', top: '3px', width: '20px', height: '20px',
                      borderRadius: '50%', backgroundColor: 'white', transition: 'transform 0.2s',
                      transform: form[item.key] ? 'translateX(25px)' : 'translateX(3px)',
                      boxShadow: shadows.sm,
                    }} />
                  </button>
                </div>
              ))}
              {!isEditing && (
                <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic', margin: 0 }}>
                  Clique sur "Modifier mon profil" pour changer ces paramètres.
                </p>
              )}
            </div>
          )}
        </div>

        {/* SAVE BAR */}
        {isEditing && (
          <div style={{
            position: 'fixed' as 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: colors.primary, borderRadius: radius.xl, padding: '16px 28px',
            display: 'flex', alignItems: 'center', gap: '20px', boxShadow: shadows.xl, zIndex: 900,
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0, whiteSpace: 'nowrap' as 'nowrap' }}>
              {avatarFile ? '📷 Nouvelle photo + modifications en attente' : 'Modifications non sauvegardées'}
            </p>
            <button
              style={{ backgroundColor: colors.accent, color: colors.primary, border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;