import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from '../components/Navigation';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';
import { useAuth } from '../context/AuthContext';

// ── CONSTANTES ────────────────────────────────────────────────────────────────

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF'];
const EDUCATION_LEVELS = [
  { value: 'bachelor',          label: 'Licence / Bachelor' },
  { value: 'master',            label: 'Master' },
  { value: 'master_specialized',label: 'Master Spécialisé' },
  { value: 'mba',               label: 'MBA' },
  { value: 'phd',               label: 'Doctorat / PhD' },
  { value: 'other',             label: 'Autre' },
];
const COUNTRIES = [
  'Afghanistan','Afrique du Sud','Albanie','Algérie','Allemagne','Andorre','Angola',
  'Antigua-et-Barbuda','Arabie Saoudite','Argentine','Arménie','Australie','Autriche',
  'Azerbaïdjan','Bahamas','Bahreïn','Bangladesh','Barbade','Belgique','Belize','Bénin',
  'Bhoutan','Biélorussie','Birmanie','Bolivie','Bosnie-Herzégovine','Botswana','Brésil',
  'Brunei','Bulgarie','Burkina Faso','Burundi','Cambodge','Cameroun','Canada','Cap-Vert',
  'Chili','Chine','Chypre','Colombie','Comores','Congo','Corée du Nord','Corée du Sud',
  'Costa Rica',"Côte d'Ivoire",'Croatie','Cuba','Danemark','Djibouti','Dominique',
  'Égypte','Émirats Arabes Unis','Équateur','Érythrée','Espagne','Estonie','Eswatini',
  'États-Unis','Éthiopie','Fidji','Finlande','France','Gabon','Gambie','Géorgie','Ghana',
  'Grèce','Grenade','Guatemala','Guinée','Guinée-Bissau','Guinée équatoriale','Guyana',
  'Haïti','Honduras','Hongrie','Inde','Indonésie','Irak','Iran','Irlande','Islande',
  'Israël','Italie','Jamaïque','Japon','Jordanie','Kazakhstan','Kenya','Kirghizistan',
  'Kiribati','Kosovo','Koweït','Laos','Lesotho','Lettonie','Liban','Liberia','Libye',
  'Liechtenstein','Lituanie','Luxembourg','Macédoine du Nord','Madagascar','Malaisie',
  'Malawi','Maldives','Mali','Malte','Maroc','Marshall','Maurice','Mauritanie','Mexique',
  'Micronésie','Moldavie','Monaco','Mongolie','Monténégro','Mozambique','Namibie','Nauru',
  'Népal','Nicaragua','Niger','Nigéria','Norvège','Nouvelle-Zélande','Oman','Ouganda',
  'Ouzbékistan','Pakistan','Palaos','Palestine','Panama','Papouasie-Nouvelle-Guinée',
  'Paraguay','Pays-Bas','Pérou','Philippines','Pologne','Portugal','Qatar',
  'République centrafricaine','République démocratique du Congo','République dominicaine',
  'République tchèque','Roumanie','Royaume-Uni','Russie','Rwanda','Saint-Kitts-et-Nevis',
  'Saint-Marin','Saint-Vincent-et-les-Grenadines','Sainte-Lucie','Salvador','Samoa',
  'São Tomé-et-Príncipe','Sénégal','Serbie','Seychelles','Sierra Leone','Singapour',
  'Slovaquie','Slovénie','Somalie','Soudan','Soudan du Sud','Sri Lanka','Suède','Suisse',
  'Suriname','Syrie','Tadjikistan','Tanzanie','Tchad','Thaïlande','Timor oriental','Togo',
  'Tonga','Trinité-et-Tobago','Tunisie','Turkménistan','Turquie','Tuvalu','Ukraine',
  'Uruguay','Vanuatu','Vatican','Venezuela','Viêt Nam','Yémen','Zambie','Zimbabwe',
];
const PHONE_CODES = [
  { code: 'FR', dial: '+33',  flag: '🇫🇷', label: 'France (+33)' },
  { code: 'BE', dial: '+32',  flag: '🇧🇪', label: 'Belgique (+32)' },
  { code: 'CH', dial: '+41',  flag: '🇨🇭', label: 'Suisse (+41)' },
  { code: 'LU', dial: '+352', flag: '🇱🇺', label: 'Luxembourg (+352)' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', label: 'Canada (+1)' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', label: 'États-Unis (+1)' },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', label: 'Royaume-Uni (+44)' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', label: 'Allemagne (+49)' },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', label: 'Espagne (+34)' },
  { code: 'IT', dial: '+39',  flag: '🇮🇹', label: 'Italie (+39)' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', label: 'Portugal (+351)' },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', label: 'Pays-Bas (+31)' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', label: 'Maroc (+212)' },
  { code: 'SN', dial: '+221', flag: '🇸🇳', label: 'Sénégal (+221)' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', label: "Côte d'Ivoire (+225)" },
  { code: 'CM', dial: '+237', flag: '🇨🇲', label: 'Cameroun (+237)' },
  { code: 'TN', dial: '+216', flag: '🇹🇳', label: 'Tunisie (+216)' },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', label: 'Algérie (+213)' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', label: 'Émirats (+971)' },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', label: 'Japon (+81)' },
  { code: 'CN', dial: '+86',  flag: '🇨🇳', label: 'Chine (+86)' },
  { code: 'IN', dial: '+91',  flag: '🇮🇳', label: 'Inde (+91)' },
  { code: 'BR', dial: '+55',  flag: '🇧🇷', label: 'Brésil (+55)' },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', label: 'Australie (+61)' },
];
const PHONE_REGEX: { [k: string]: { regex: RegExp; format: string } } = {
  FR: { regex: /^[0-9]{9}$/,     format: '6 12 34 56 78 (9 chiffres sans le 0)' },
  BE: { regex: /^[0-9]{8,9}$/,   format: '12 34 56 78 (8-9 chiffres)' },
  CH: { regex: /^[0-9]{9}$/,     format: '78 123 45 67 (9 chiffres)' },
  LU: { regex: /^[0-9]{6,9}$/,   format: '621 123 456 (6-9 chiffres)' },
  CA: { regex: /^[0-9]{10}$/,    format: '416 123 4567 (10 chiffres)' },
  US: { regex: /^[0-9]{10}$/,    format: '212 123 4567 (10 chiffres)' },
  GB: { regex: /^[0-9]{10}$/,    format: '7911 123456 (10 chiffres)' },
  DE: { regex: /^[0-9]{10,11}$/, format: '151 12345678 (10-11 chiffres)' },
  ES: { regex: /^[0-9]{9}$/,     format: '612 345 678 (9 chiffres)' },
  IT: { regex: /^[0-9]{9,10}$/,  format: '312 345 6789 (9-10 chiffres)' },
  PT: { regex: /^[0-9]{9}$/,     format: '912 345 678 (9 chiffres)' },
  NL: { regex: /^[0-9]{9}$/,     format: '612 345 678 (9 chiffres)' },
  MA: { regex: /^[0-9]{9}$/,     format: '612 345 678 (9 chiffres)' },
  SN: { regex: /^[0-9]{9}$/,     format: '77 123 45 67 (9 chiffres)' },
  CI: { regex: /^[0-9]{8}$/,     format: '07 12 34 56 (8 chiffres)' },
  CM: { regex: /^[0-9]{9}$/,     format: '677 123 456 (9 chiffres)' },
  TN: { regex: /^[0-9]{8}$/,     format: '20 123 456 (8 chiffres)' },
  DZ: { regex: /^[0-9]{9}$/,     format: '551 234 567 (9 chiffres)' },
  AE: { regex: /^[0-9]{9}$/,     format: '50 123 4567 (9 chiffres)' },
  JP: { regex: /^[0-9]{10,11}$/, format: '90 1234 5678 (10-11 chiffres)' },
  CN: { regex: /^[0-9]{11}$/,    format: '131 2345 6789 (11 chiffres)' },
  IN: { regex: /^[0-9]{10}$/,    format: '98765 43210 (10 chiffres)' },
  BR: { regex: /^[0-9]{10,11}$/, format: '11 91234 5678 (10-11 chiffres)' },
  AU: { regex: /^[0-9]{9}$/,     format: '412 345 678 (9 chiffres)' },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const emptyForm = () => ({
  firstName: '', lastName: '', linkedinUrl: '', language: 'fr',
  isScorePublic: false, isProgressPublic: false, dateOfBirth: '',
  bio: '', city: '', country: 'France', status: 'student',
  lastSchool: '', educationLevel: 'master', fieldOfStudy: '',
  company: '', jobTitle: '', phoneNumber: '', phoneCountryCode: 'FR',
  yearsOfExperience: '', salary: '', salaryCurrency: 'EUR', workCountry: 'France',
});

const profileToForm = (p: any) => ({
  firstName:        p.firstName        || '',
  lastName:         p.lastName         || '',
  linkedinUrl:      p.linkedinUrl      || '',
  language:         p.language         || 'fr',
  isScorePublic:    p.isScorePublic    || false,
  isProgressPublic: p.isProgressPublic || false,
  dateOfBirth:      p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
  bio:              p.bio              || '',
  city:             p.city             || '',
  country:          p.country          || 'France',
  status:           p.status           || 'student',
  lastSchool:       p.lastSchool       || '',
  educationLevel:   p.educationLevel   || 'master',
  fieldOfStudy:     p.fieldOfStudy     || '',
  company:          p.company          || '',
  jobTitle:         p.jobTitle         || '',
  phoneNumber:      p.phoneNumber      || '',
  phoneCountryCode: p.phoneCountryCode || 'FR',
  yearsOfExperience: p.yearsOfExperience != null ? String(p.yearsOfExperience) : '',
  salary:           p.salary           || '',
  salaryCurrency:   p.salaryCurrency   || 'EUR',
  workCountry:      p.workCountry      || 'France',
});

// Nettoie le formulaire avant envoi — évite les erreurs de type PostgreSQL
const cleanFormForApi = (form: any) => {
  const cleaned = { ...form };
  if (cleaned.dateOfBirth === '')      cleaned.dateOfBirth      = null;
  if (cleaned.salary === '')           cleaned.salary           = null;
  if (cleaned.yearsOfExperience === '' || cleaned.yearsOfExperience === null) {
    cleaned.yearsOfExperience = null;
  } else {
    const parsed = parseInt(cleaned.yearsOfExperience, 10);
    cleaned.yearsOfExperience = isNaN(parsed) ? null : parsed;
  }
  return cleaned;
};

// ── COMPOSANT CROPPER ─────────────────────────────────────────────────────────

interface CropperProps {
  src: string;
  onCrop: (blob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<CropperProps> = ({ src, onCrop, onCancel }) => {
  const canvasPreviewRef = useRef<HTMLCanvasElement>(null);
  const canvasOutputRef  = useRef<HTMLCanvasElement>(null);
  const imageRef         = useRef<HTMLImageElement | null>(null);

  const DISPLAY = 280; // taille affichée du cercle
  const OUTPUT  = 400; // taille de l'image exportée

  const [scale, setScale]       = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart               = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  // Charge l'image une seule fois
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      // Scale initial : couvre le cercle entièrement
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const initialScale = DISPLAY / minDim;
      setScale(initialScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src]);

  // Redessine le canvas de prévisualisation à chaque changement
  useEffect(() => {
    const canvas = canvasPreviewRef.current;
    const img    = imageRef.current;
    if (!canvas || !img || imgNatural.w === 0) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width  = DISPLAY;
    canvas.height = DISPLAY;
    ctx.clearRect(0, 0, DISPLAY, DISPLAY);

    // Clip circulaire
    ctx.save();
    ctx.beginPath();
    ctx.arc(DISPLAY / 2, DISPLAY / 2, DISPLAY / 2, 0, Math.PI * 2);
    ctx.clip();

    // Dimensions affichées de l'image
    const dispW = imgNatural.w * scale;
    const dispH = imgNatural.h * scale;

    // Position : centrée + offset utilisateur
    const drawX = (DISPLAY - dispW) / 2 + offset.x;
    const drawY = (DISPLAY - dispH) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, dispW, dispH);
    ctx.restore();
  }, [scale, offset, imgNatural]);

  // Drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    });
  };
  const onMouseUp = () => setDragging(false);

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({
      x: dragStart.current.ox + (t.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (t.clientY - dragStart.current.my),
    });
  };

  const handleCrop = () => {
    const img    = imageRef.current;
    const canvas = canvasOutputRef.current;
    if (!img || !canvas) return;

    canvas.width  = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d')!;

    // Même calcul que la prévisualisation, mis à l'échelle OUTPUT
    const ratio  = OUTPUT / DISPLAY;
    const dispW  = imgNatural.w * scale;
    const dispH  = imgNatural.h * scale;
    const drawX  = ((DISPLAY - dispW) / 2 + offset.x) * ratio;
    const drawY  = ((DISPLAY - dispH) / 2 + offset.y) * ratio;
    const outW   = dispW * ratio;
    const outH   = dispH * ratio;

    // Clip circulaire
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, drawX, drawY, outW, outH);

    canvas.toBlob(blob => {
      if (blob) onCrop(blob, canvas.toDataURL('image/png'));
    }, 'image/png', 0.95);
  };

  return (
    <div style={{
      position: 'fixed' as const, inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: colors.surface, borderRadius: radius.xl,
        padding: '32px', maxWidth: '420px', width: '100%',
        textAlign: 'center' as const,
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>
          Cadrer la photo
        </h3>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 20px 0' }}>
          Déplace l'image · Ajuste le zoom avec le slider
        </p>

        {/* Canvas de prévisualisation — cliquable pour drag */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <canvas
            ref={canvasPreviewRef}
            width={DISPLAY}
            height={DISPLAY}
            style={{
              borderRadius: '50%',
              border: `3px solid ${colors.accent}`,
              cursor: dragging ? 'grabbing' : 'grab',
              display: 'block',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />
        </div>

        {/* Slider zoom */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>
            Zoom
          </label>
          <input
            type="range"
            min={imgNatural.w > 0 ? DISPLAY / Math.min(imgNatural.w, imgNatural.h) : 0.5}
            max="3"
            step="0.02"
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Canvas output caché */}
        <canvas ref={canvasOutputRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '12px', borderRadius: radius.md, border: `2px solid ${colors.border}`, backgroundColor: 'white', color: colors.primary, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={handleCrop}
            style={{ flex: 1, padding: '12px', borderRadius: radius.md, border: 'none', backgroundColor: colors.accent, color: colors.primary, fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
          >
            ✓ Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

const Profile = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile]             = useState<any>(null);
  const [isEditing, setIsEditing]         = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [phoneError, setPhoneError]       = useState('');
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [saveError, setSaveError]         = useState('');
  const [isLoading, setIsLoading]         = useState(true);
  const [isDragging, setIsDragging]       = useState(false);
  const [form, setForm]                   = useState<any>(emptyForm());
  const [activeTab, setActiveTab]         = useState<'personal' | 'professional' | 'privacy' | 'social'>('personal');

  // Photo
  const [rawImageSrc, setRawImageSrc]     = useState<string | null>(null);
  const [showCropper, setShowCropper]     = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob]       = useState<Blob | null>(null);

  // Social (structure prête — backend à brancher)
    const [friends, setFriends]             = useState<any[]>([]);
    const [requests, setRequests]         = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [searchQuery, setSearchQuery]     = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

  // ── Chargement ─────────────────────────────────────────────
  useEffect(() => {
    api.get('/users/me')
      .then(res => {
        setProfile(res.data);
        setForm(profileToForm(res.data));
      })
      .catch(err => console.error('Erreur profil:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Sauvegarde ─────────────────────────────────────────────
  const handleSave = async () => {
    if (phoneError) return;
    setIsSaving(true);
    setSaveError('');
    try {
      // 1. Upload avatar si modifié
      if (avatarBlob) {
        const fd = new FormData();
        fd.append('avatar', avatarBlob, 'avatar.png');
        const avatarRes = await api.post('/users/me/avatar', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Met à jour l'aperçu avec l'URL serveur immédiatement
        setProfile((prev: any) => ({ ...prev, avatarUrl: avatarRes.data.avatarUrl }));
        setAvatarPreview(null);
        setAvatarBlob(null);
      }

      // 2. Sauvegarde des infos — données nettoyées
      const res = await api.put('/users/me', cleanFormForApi(form));
      setProfile(res.data);
      setIsEditing(false);
      setSaveSuccess(true);
      await refreshUser();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setSaveError('Une erreur est survenue. Vérifie les champs et réessaie.');
      setTimeout(() => setSaveError(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(profileToForm(profile));
    setAvatarPreview(null);
    setAvatarBlob(null);
    setRawImageSrc(null);
    setIsEditing(false);
    setPhoneError('');
  };

  // ── Photo ───────────────────────────────────────────────────
  const handleFileSelected = (file: File) => {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) return;
    const url = URL.createObjectURL(file);
    setRawImageSrc(url);
    setShowCropper(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleCropDone = (blob: Blob, previewUrl: string) => {
    setAvatarBlob(blob);
    setAvatarPreview(previewUrl);
    setShowCropper(false);
  };

  const handleSendRequest = async (userId: string) => {
  await api.post(`/friends/request/${userId}`);
  setSearchResults(prev =>
    prev.map(u => u.id === userId ? { ...u, requestSent: true } : u)
  );
};

const handleAccept = async (userId: string) => {
  await api.post(`/friends/accept/${userId}`);
  const accepted = requests.find(r => r.id === userId);
  setRequests(prev => prev.filter(r => r.id !== userId));
  if (accepted) setFriends(prev => [...prev, accepted]);
};

const handleDecline = async (userId: string) => {
  await api.post(`/friends/decline/${userId}`);
  setRequests(prev => prev.filter(r => r.id !== userId));
};

const handleCancelRequest = async (userId: string) => {
  await api.delete(`/friends/${userId}`);
  setSentRequests(prev => prev.filter(r => r.id !== userId));
};

const handleRemoveFriend = async (userId: string) => {
  if (!window.confirm('Supprimer cet ami ?')) return;
  await api.delete(`/friends/${userId}`);
  setFriends(prev => prev.filter(f => f.id !== userId));
};

const handleMarkAllRead = async () => {
  await api.post('/notifications/read-all');
  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  setUnreadCount(0);
};

const handleDeleteNotif = async (notifId: string) => {
  await api.delete(`/notifications/${notifId}`);
  setNotifications((prev: any[]) => prev.filter((n: any) => n.id !== notifId));
  const wasUnread = notifications.find((n: any) => n.id === notifId && !n.isRead);
  if (wasUnread) setUnreadCount((prev: number) => Math.max(0, prev - 1));
};

  // ── Social (recherche) ─────────────────────────────────────
// Charge les données sociales quand on ouvre l'onglet
useEffect(() => {
  if (activeTab !== 'social') return;
  Promise.all([
    api.get('/friends'),
    api.get('/friends/requests'),
    api.get('/friends/sent'),
    api.get('/notifications'),
    api.get('/notifications/unread-count'),
  ]).then(([f, r, s, n, u]) => {
    setFriends(f.data);
    setRequests(r.data);
    setSentRequests(s.data);
    setNotifications(n.data);
    setUnreadCount(typeof u.data === 'number' ? u.data : u.data?.count || 0);
  }).catch(console.error);
}, [activeTab]);

// Recherche d'utilisateurs
useEffect(() => {
  if (!searchQuery.trim() || searchQuery.length < 2) {
    setSearchResults([]);
    return;
  }
  const t = setTimeout(() => {
    api.get(`/search/users?q=${encodeURIComponent(searchQuery)}`)
      .then(res => setSearchResults(res.data || []))
      .catch(() => setSearchResults([]));
  }, 300);
  return () => clearTimeout(t);
}, [searchQuery]);

  // ── Helpers ─────────────────────────────────────────────────
  const validatePhone = (number: string, code: string) => {
    if (!number.trim()) { setPhoneError(''); return; }
    const cleaned = number.replace(/[\s\-\.()]/g, '');
    const rule = PHONE_REGEX[code];
    setPhoneError(rule && !rule.regex.test(cleaned) ? `Format attendu : ${rule.format}` : '');
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
    return Math.round((fields.filter(f => f?.toString().trim()).length / fields.length) * 100);
  };

  const completion = getCompletionScore();
  const avatarSrc  = avatarPreview
    || (profile?.avatarUrl ? `http://localhost:3001${profile.avatarUrl}` : null);

  // ── Styles ──────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    padding: '11px 14px', borderRadius: radius.md,
    border: `2px solid ${colors.border}`, fontSize: '15px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
    backgroundColor: '#FAFBFF', fontFamily: 'inherit', color: colors.textPrimary,
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'none' };
  const fieldStyle:  React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
  const labelStyle:  React.CSSProperties = { fontSize: '12px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' };
  const valueStyle:  React.CSSProperties = { fontSize: '15px', color: colors.textPrimary, margin: 0 };

  if (isLoading) return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ color: colors.textMuted }}>Chargement du profil...</p>
      </div>
    </div>
  );

  // ── RENDU ────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navigation />

      {/* Cropper modal */}
      {showCropper && rawImageSrc && (
        <ImageCropper
          src={rawImageSrc}
          onCrop={handleCropDone}
          onCancel={() => { setShowCropper(false); setRawImageSrc(null); }}
        />
      )}

      {/* Toast succès */}
      {saveSuccess && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', backgroundColor: colors.success, borderRadius: radius.lg, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, boxShadow: shadows.lg }}>
          <span>✅</span>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>Profil mis à jour !</p>
        </div>
      )}

      {/* Toast erreur */}
      {saveError && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', backgroundColor: '#EF4444', borderRadius: radius.lg, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, boxShadow: shadows.lg }}>
          <span>⚠️</span>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>{saveError}</p>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '88px 24px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── HEADER ── */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

              {/* AVATAR */}
              <div
                style={{
                  width: '100px', height: '100px', borderRadius: radius.full,
                  border: isEditing ? `3px dashed ${isDragging ? colors.accent : colors.border}` : `4px solid ${colors.accent}`,
                  backgroundColor: isEditing ? (isDragging ? colors.accentLight : '#FAFBFF') : colors.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isEditing ? 'pointer' : 'default',
                  overflow: 'hidden', flexShrink: 0, position: 'relative',
                  transition: 'all 0.2s',
                }}
                onDragOver={e => { if (isEditing) { e.preventDefault(); setIsDragging(true); } }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={isEditing ? handleDrop : undefined}
                onClick={() => isEditing && document.getElementById('avatarInput')?.click()}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  isEditing ? (
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <p style={{ fontSize: '24px', margin: '0 0 4px 0' }}>📷</p>
                      <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0, lineHeight: '1.3' }}>
                        {isDragging ? 'Dépose ici' : 'Clic ou drag'}
                      </p>
                    </div>
                  ) : (
                    <span style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>
                      {form.firstName?.[0] || ''}{form.lastName?.[0] || ''}
                    </span>
                  )
                )}
                {isEditing && avatarSrc && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <p style={{ color: 'white', fontSize: '11px', fontWeight: '700', textAlign: 'center', margin: 0 }}>
                      📷 Changer
                    </p>
                  </div>
                )}
                <input id="avatarInput" type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleFileInput} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.primary, margin: 0 }}>
                  {profile?.firstName} {profile?.lastName}
                </h1>
                {profile?.jobTitle && profile?.company && (
                  <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0 }}>
                    {profile.jobTitle} chez {profile.company}
                  </p>
                )}
                {profile?.lastSchool && !profile?.company && (
                  <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0 }}>{profile.lastSchool}</p>
                )}
                {profile?.city && (
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                    📍 {profile.city}{profile.country ? `, ${profile.country}` : ''}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0, fontStyle: 'italic' }}>
                  Membre depuis {getMemberSince()}
                </p>
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: colors.textMuted }}>Profil complété</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: completion >= 80 ? colors.success : colors.accent }}>
                      {completion}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.background, borderRadius: radius.full, width: '200px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: radius.full, backgroundColor: completion >= 80 ? colors.success : colors.accent, width: `${completion}%`, transition: 'width 0.6s' }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
              style={{ backgroundColor: isEditing ? 'transparent' : colors.primary, color: isEditing ? colors.textMuted : 'white', border: isEditing ? `2px solid ${colors.border}` : 'none', borderRadius: radius.md, padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              {isEditing ? '✕ Annuler' : '✏️ Modifier mon profil'}
            </button>
          </div>

          {profile?.bio && !isEditing && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md, borderLeft: `4px solid ${colors.accent}` }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.surface, padding: '6px', borderRadius: radius.lg, boxShadow: shadows.sm }}>
          {[
            { key: 'personal',     label: '👤 Informations' },
            { key: 'professional', label: form.status === 'student' ? '🎓 Parcours' : '💼 Carrière' },
            { key: 'privacy',      label: '🔒 Confidentialité' },
            { key: 'social', label: `👥 Social${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          ].map(tab => (
            <button key={tab.key}
              style={{ flex: 1, padding: '10px 12px', borderRadius: radius.md, border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: activeTab === tab.key ? colors.primary : 'transparent', color: activeTab === tab.key ? 'white' : colors.textMuted, transition: 'all 0.2s', fontFamily: 'inherit' }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONTENU ONGLETS ── */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>

          {/* INFORMATIONS */}
          {activeTab === 'personal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Prénom</label>
                  {isEditing ? <input style={inputStyle} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /> : <p style={valueStyle}>{profile?.firstName || '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nom</label>
                  {isEditing ? <input style={inputStyle} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /> : <p style={valueStyle}>{profile?.lastName || '—'}</p>}
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
                        <button key={s.v} onClick={() => setForm({ ...form, status: s.v })}
                          style={{ flex: 1, padding: '10px', borderRadius: radius.md, cursor: 'pointer', border: `2px solid ${form.status === s.v ? colors.primary : colors.border}`, backgroundColor: form.status === s.v ? '#EEF2FF' : 'white', color: form.status === s.v ? colors.primary : colors.textPrimary, fontWeight: form.status === s.v ? '700' : '500', fontSize: '13px' }}>
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
                  {isEditing ? <input style={inputStyle} placeholder="Paris" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /> : <p style={valueStyle}>{profile?.city || '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Pays</label>
                  {isEditing ? (
                    <select style={selectStyle} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : <p style={valueStyle}>{profile?.country || '—'}</p>}
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Bio / Description</label>
                {isEditing ? (
                  <>
                    <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Parle de toi, de tes ambitions..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} maxLength={1000} />
                  </>
                ) : <p style={{ ...valueStyle, lineHeight: '1.6' }}>{profile?.bio || '—'}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Profil LinkedIn</label>
                {isEditing
                  ? <input style={inputStyle} placeholder="https://linkedin.com/in/ton-profil" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} />
                  : <p style={valueStyle}>{profile?.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: colors.primary }}>{profile.linkedinUrl}</a> : '—'}</p>}
              </div>

              {/* Téléphone */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Numéro de téléphone</label>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select style={{ ...selectStyle, width: '160px', flex: 'none' }} value={form.phoneCountryCode}
                        onChange={e => { setForm({ ...form, phoneCountryCode: e.target.value }); validatePhone(form.phoneNumber, e.target.value); }}>
                        {PHONE_CODES.map(p => <option key={p.code} value={p.code}>{p.flag} {p.dial}</option>)}
                      </select>
                      <input style={{ ...inputStyle, flex: 1, borderColor: phoneError ? '#EF4444' : colors.border }} type="tel"
                        placeholder={PHONE_REGEX[form.phoneCountryCode]?.format || 'Numéro'} value={form.phoneNumber}
                        onChange={e => { const c = e.target.value.replace(/[^0-9\s\-.()+]/g, ''); setForm({ ...form, phoneNumber: c }); validatePhone(c, form.phoneCountryCode); }} />
                    </div>
                    {phoneError && <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>⚠️ {phoneError}</p>}
                    {!phoneError && form.phoneNumber && <p style={{ fontSize: '12px', color: colors.success, margin: 0 }}>✅ Format valide</p>}
                  </div>
                ) : (
                  <p style={valueStyle}>
                    {profile?.phoneNumber ? `${PHONE_CODES.find(p => p.code === profile.phoneCountryCode)?.dial || ''} ${profile.phoneNumber}` : '—'}
                  </p>
                )}
              </div>

              {/* Langue */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Langue de l'application</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['fr', 'en'].map(lang => (
                      <button key={lang} onClick={() => setForm({ ...form, language: lang })}
                        style={{ flex: 1, padding: '10px', borderRadius: radius.md, cursor: 'pointer', border: `2px solid ${form.language === lang ? colors.primary : colors.border}`, backgroundColor: form.language === lang ? '#EEF2FF' : 'white', color: form.language === lang ? colors.primary : colors.textPrimary, fontWeight: form.language === lang ? '700' : '500', fontSize: '14px' }}>
                        {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                      </button>
                    ))}
                  </div>
                ) : <p style={valueStyle}>{profile?.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</p>}
              </div>
            </div>
          )}

          {/* PARCOURS / CARRIÈRE */}
          {activeTab === 'professional' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Dernière école / Université</label>
                  {isEditing
                    ? <AutocompleteInput value={form.lastSchool} onChange={val => setForm({ ...form, lastSchool: val })} endpoint="schools" placeholder="HEC Paris, Sciences Po..." />
                    : <p style={valueStyle}>{profile?.lastSchool || '—'}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Niveau d'études</label>
                  {isEditing ? (
                    <select style={selectStyle} value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })}>
                      {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  ) : <p style={valueStyle}>{EDUCATION_LEVELS.find(e => e.value === profile?.educationLevel)?.label || '—'}</p>}
                </div>
                <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Domaine d'études / Spécialisation</label>
                  {isEditing
                    ? <input style={inputStyle} placeholder="Finance, Droit des affaires..." value={form.fieldOfStudy} onChange={e => setForm({ ...form, fieldOfStudy: e.target.value })} />
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
                        ? <AutocompleteInput value={form.company} onChange={val => setForm({ ...form, company: val })} endpoint="companies" placeholder="Goldman Sachs, LVMH..." />
                        : <p style={valueStyle}>{profile?.company || '—'}</p>}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Fonction / Poste</label>
                      {isEditing
                        ? <input style={inputStyle} placeholder="Analyste M&A..." value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
                        : <p style={valueStyle}>{profile?.jobTitle || '—'}</p>}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Années d'expérience</label>
                      {isEditing
                        ? <input type="number" style={inputStyle} min="0" max="50" value={form.yearsOfExperience}
                            onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })} />
                        : <p style={valueStyle}>{profile?.yearsOfExperience ? `${profile.yearsOfExperience} an(s)` : '—'}</p>}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Pays de travail</label>
                      {isEditing ? (
                        <select style={selectStyle} value={form.workCountry} onChange={e => setForm({ ...form, workCountry: e.target.value })}>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : <p style={valueStyle}>{profile?.workCountry || '—'}</p>}
                    </div>
                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Salaire annuel brut (optionnel — strictement privé)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="number" style={{ ...inputStyle, flex: 1 }} placeholder="65000" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                          <select style={{ ...selectStyle, width: '100px', flex: 'none' }} value={form.salaryCurrency} onChange={e => setForm({ ...form, salaryCurrency: e.target.value })}>
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      ) : (
                        <p style={valueStyle}>
                          {profile?.salary ? `${parseInt(profile.salary).toLocaleString()} ${profile.salaryCurrency}` : '—'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONFIDENTIALITÉ */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, lineHeight: '1.6' }}>
                Choisis ce que tes amis peuvent voir sur ton profil public Knoweo.
              </p>
              {[
                { key: 'isScorePublic',    label: 'Score XP visible',     desc: 'Tes points totaux seront affichés sur ton profil public' },
                { key: 'isProgressPublic', label: 'Progression visible',  desc: 'Ta progression par domaine sera visible par tes amis' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: colors.background, borderRadius: radius.md }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 4px 0' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => { if (isEditing) setForm({ ...form, [item.key]: !form[item.key] }); }}
                    style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: isEditing ? 'pointer' : 'default', backgroundColor: form[item.key] ? colors.success : colors.border, position: 'relative', transition: 'background-color 0.2s', padding: 0, flexShrink: 0 }}
                  >
                    <span style={{ position: 'absolute', top: '3px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', transition: 'transform 0.2s', transform: form[item.key] ? 'translateX(25px)' : 'translateX(3px)', boxShadow: shadows.sm, display: 'block' }} />
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

          {/* SOCIAL */}
          {activeTab === 'social' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Recherche d'utilisateurs */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 12px 0' }}>🔍 Trouver des utilisateurs</h3>
                <input
                  style={inputStyle}
                  placeholder="Rechercher un utilisateur par nom..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {searchResults.map((u: any) => (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: colors.background, borderRadius: radius.md }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: radius.full, backgroundColor: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
                            {u.avatarUrl
                              ? <img src={`http://localhost:3001${u.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: colors.primary, margin: 0 }}>{u.firstName} {u.lastName}</p>
                            {u.jobTitle && <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{u.jobTitle}{u.company ? ` · ${u.company}` : ''}</p>}
                          </div>
                        </div>
                        <button
                          style={{ padding: '6px 14px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
                          onClick={() => handleSendRequest(u.id)}
                        >
                          {u.requestSent ? '✓ Envoyée' : '+ Ajouter'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Demandes reçues */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 12px 0' }}>
                  📬 Demandes reçues
                  {requests.length > 0 && <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '700', color: 'white', backgroundColor: '#EF4444', padding: '2px 8px', borderRadius: radius.full }}>{requests.length}</span>}
                </h3>
                {requests.length === 0 ? (
                  <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic' }}>Aucune demande en attente.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {requests.map((r: any) => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: colors.background, borderRadius: radius.md }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, margin: 0 }}>{r.firstName} {r.lastName}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ padding: '6px 12px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleAccept(r.id)}>✓ Accepter</button>
                          <button style={{ padding: '6px 12px', backgroundColor: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', cursor: 'pointer' }} onClick={() => handleDecline(r.id)}>✕ Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Demandes envoyées */}
                <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 12px 0' }}>
                    📤 Demandes envoyées ({sentRequests.length})
                </h3>
                {sentRequests.length === 0 ? (
                    <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic' }}>
                    Aucune demande en attente.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                    {sentRequests.map((r: any) => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: colors.background, borderRadius: radius.md }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: radius.full, backgroundColor: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
                            {r.avatarUrl
                                ? <img src={`http://localhost:3001${r.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : `${r.firstName?.[0] || ''}${r.lastName?.[0] || ''}`}
                            </div>
                            <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: colors.primary, margin: 0 }}>
                                {r.firstName} {r.lastName}
                            </p>
                            <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                                En attente de réponse
                            </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleCancelRequest(r.id)}
                            style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#EF4444', border: `1px solid #EF4444`, borderRadius: radius.md, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            Annuler
                        </button>
                        </div>
                    ))}
                    </div>
                )}
                </div>

              {/* Mes amis */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 12px 0' }}>
                  👥 Mes amis ({friends.length})
                </h3>
                {friends.length === 0 ? (
                  <div style={{ padding: '24px', backgroundColor: colors.background, borderRadius: radius.md, textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>👋</p>
                    <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
                      Tu n'as pas encore d'amis sur Knoweo. Utilise la recherche pour en trouver !
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {friends.map((f: any) => (
                      <div key={f.id} style={{ padding: '16px', backgroundColor: colors.background, borderRadius: radius.lg, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: radius.full, backgroundColor: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                          {f.firstName?.[0]}{f.lastName?.[0]}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: colors.primary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.firstName} {f.lastName}</p>
                            <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
                             {f.isScorePublic && f.totalXP !== null ? `${f.totalXP.toLocaleString()} XP` : 'Score privé'}
                            </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Notifications */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: 0 }}>
                    🔔 Notifications
                    {unreadCount > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: 'white', backgroundColor: '#EF4444', padding: '2px 8px', borderRadius: radius.full }}>
                        {unreadCount}
                        </span>
                    )}
                    </h3>
                    {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        style={{ fontSize: '12px', color: colors.textMuted, background: 'none', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        Tout lire
                    </button>
                    )}
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic' }}>Aucune notification pour l'instant.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.map((n: any) => (
                    <div key={n.id} style={{ padding: '12px 16px', backgroundColor: n.isRead ? colors.background : colors.accentLight, borderRadius: radius.md, borderLeft: `3px solid ${n.isRead ? colors.border : colors.accent}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: colors.textPrimary, margin: '0 0 3px 0', lineHeight: '1.4' }}>{n.content}</p>
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                        {!n.isRead && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }} />
                        )}
                        <button
                            onClick={() => handleDeleteNotif(n.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, fontSize: '14px', padding: '2px 4px', lineHeight: 1, fontFamily: 'inherit' }}
                            title="Supprimer">
                            ✕
                        </button>
                        </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* ── SAVE BAR ── */}
        {isEditing && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: colors.primary, borderRadius: radius.xl, padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: shadows.xl, zIndex: 900 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0, whiteSpace: 'nowrap' }}>
              {avatarBlob ? '📷 Nouvelle photo + modifications en attente' : 'Modifications non sauvegardées'}
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving || !!phoneError}
              style={{ backgroundColor: isSaving || phoneError ? colors.border : colors.accent, color: colors.primary, border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: isSaving || phoneError ? 'not-allowed' : 'pointer' }}
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