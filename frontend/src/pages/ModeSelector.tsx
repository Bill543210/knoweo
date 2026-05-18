import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { colors, shadows, radius, font } from '../styles';

interface Mode {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  color: string;
  available: boolean;
}

const MODES: Mode[] = [
  {
    id: 'infini',
    label: 'Mode Infini',
    icon: '♾️',
    tagline: 'Apprends à ton rythme, sans limite.',
    description: "Les questions s'adaptent à ton niveau en temps réel. Plus tu progresses, plus elles deviennent difficiles.",
    features: [
      '📊 Algorithme adaptatif par niveau',
      '🎯 Choix des domaines et des niveaux',
      '⏱️ Chrono optionnel par question',
      '💬 Commentaires et explications',
      '🔥 Streaks et bonus XP',
    ],
    color: colors.primary,
    available: true,
  },
  {
    id: 'revision',
    label: 'Mode Révision',
    icon: '🎯',
    tagline: 'Travaille tes points faibles.',
    description: "L'algorithme sélectionne les questions sur lesquelles tu as le plus de difficultés. Répète jusqu'à maîtrise complète.",
    features: [
      '🧠 Questions triées par difficulté personnelle',
      '🔁 Répétitions espacées configurables',
      '✅ Session terminée quand tout est maîtrisé',
      '📈 Suivi de progression en temps réel',
      '💬 Commentaires et explications',
    ],
    color: '#6366F1',
    available: true,
  },
  {
    id: 'examen',
    label: 'Mode Examen',
    icon: '📝',
    tagline: 'Teste-toi en conditions réelles.',
    description: "Aucune correction pendant le quiz. Tu passes toutes les questions à la suite et tu obtiens ton score détaillé à la fin.",
    features: [
      '🚫 Aucun feedback pendant la session',
      '⏱️ Chrono obligatoire par question',
      '📊 Score détaillé et corrigé à la fin',
      '🏆 Bonus XP selon la performance',
      '📋 Jusqu\'à 30 questions par session',
    ],
    color: '#EF4444',
    available: true,
  },
  {
    id: 'entretien',
    label: 'Mode Entretien',
    icon: '🎙️',
    tagline: 'Simule un vrai entretien finance.',
    description: "Uniquement les questions typiques d'entretien, sélectionnées par nos experts. Chrono obligatoire, feedback différé. Sauras-tu décrocher le poste ?",
    features: [
      '🎙️ Questions typiques d\'entretien uniquement',
      '⏱️ Chrono obligatoire — pression maximale',
      '🚫 Aucun feedback pendant la session',
      '📊 Score final : Junior / Senior / Expert',
      '💡 Corrigé complet avec explications à la fin',
    ],
    color: '#F59E0B',
    available: true,
  },
];

// Labels des catégories pour le fil d'ariane
const CATEGORY_LABELS: { [key: string]: string } = {
  finance: 'Finance',
  data: 'Data & IA',
  strategy: 'Stratégie',
};

const ModeSelector = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const categoryLabel = CATEGORY_LABELS[category || ''] || category;

  return (
    <div style={{
      backgroundColor: colors.background,
      minHeight: '100vh',
      fontFamily: font.family,
    }}>
      <Navigation />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px 64px' }}>

        {/* FIL D'ARIANE */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '32px',
        }}>
          <button
            onClick={() => navigate('/learn')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', color: colors.textMuted, padding: 0,
              fontFamily: font.family,
            }}
          >
            Disciplines
          </button>
          <span style={{ color: colors.textMuted, fontSize: '14px' }}>›</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: colors.primary }}>
            {categoryLabel}
          </span>
        </div>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px', fontWeight: '800',
            color: colors.primary, margin: '0 0 8px 0',
          }}>
            Comment veux-tu travailler ?
          </h1>
          <p style={{ fontSize: '15px', color: colors.textMuted, margin: 0 }}>
            Choisis le mode qui correspond à ton objectif du moment.
          </p>
        </div>

        {/* CARTES MODES */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
          {MODES.map(mode => (
            <ModeCard
              key={mode.id}
              mode={mode}
              onClick={() => mode.available && navigate(`/learn/${category}/${mode.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── CARTE MODE ────────────────────────────────────────────────────────────────
const ModeCard = ({
  mode,
  onClick,
}: {
  mode: Mode;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        border: `2px solid ${hovered ? mode.color : colors.border}`,
        boxShadow: hovered ? shadows.md : shadows.sm,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: mode.available ? 'pointer' : 'default',
        opacity: mode.available ? 1 : 0.6,
      }}
    >
      {/* LIGNE PRINCIPALE */}
      <div
        onClick={onClick}
        style={{
          padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}
      >
        {/* Icône */}
        <div style={{
          width: '60px', height: '60px', flexShrink: 0,
          backgroundColor: `${mode.color}12`,
          borderRadius: radius.lg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px',
        }}>
          {mode.icon}
        </div>

        {/* Texte */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{
              fontSize: '18px', fontWeight: '800',
              color: colors.primary, margin: 0,
            }}>
              {mode.label}
            </h2>
            {!mode.available && (
              <span style={{
                fontSize: '11px', fontWeight: '700',
                color: colors.textMuted,
                backgroundColor: colors.border,
                padding: '2px 8px', borderRadius: radius.full,
              }}>
                Bientôt
              </span>
            )}
          </div>
          <p style={{
            fontSize: '13px', fontWeight: '600',
            color: mode.color, margin: '0 0 4px 0',
          }}>
            {mode.tagline}
          </p>
          <p style={{
            fontSize: '13px', color: colors.textSecondary,
            margin: 0, lineHeight: '1.5',
          }}>
            {mode.description}
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'flex-end', gap: '8px', flexShrink: 0,
        }}>
          {mode.available && (
            <div style={{
              padding: '10px 20px',
              backgroundColor: mode.color,
              color: 'white', borderRadius: radius.md,
              fontSize: '14px', fontWeight: '700',
              whiteSpace: 'nowrap' as const,
            }}>
              Choisir →
            </div>
          )}
          {/* Bouton détails */}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(p => !p); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: colors.textMuted,
              padding: '4px 8px', borderRadius: radius.sm,
              fontFamily: font.family,
            }}
          >
            {expanded ? '▲ Moins' : '▼ Détails'}
          </button>
        </div>
      </div>

      {/* FEATURES (dépliable) */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '16px 28px 20px 108px',
          backgroundColor: `${mode.color}06`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '8px',
          }}>
            {mode.features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{
                  fontSize: '13px', color: colors.textSecondary,
                  lineHeight: '1.5',
                }}>
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;