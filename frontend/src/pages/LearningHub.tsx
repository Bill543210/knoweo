import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { colors, shadows, radius, font } from '../styles';

interface Category {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  available: boolean;
  stats?: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'finance',
    label: 'Finance',
    description: 'M&A, Private Equity, Marchés financiers, Comptabilité et plus encore.',
    icon: '📈',
    color: '#0F2044',
    gradient: 'linear-gradient(135deg, #0F2044 0%, #1B3A6B 100%)',
    available: true,
    stats: '8 domaines · 300+ questions',
  },
  {
    id: 'economie',
    label: 'Économie',
    description: 'Macro et microéconomie, politique monétaire, commerce international, cycles économiques.',
    icon: '🌍',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
    available: false,
  },
  {
    id: 'data',
    label: 'Data & IA',
    description: 'Machine Learning, SQL, Python, statistiques et visualisation.',
    icon: '🤖',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    available: false,
  },
  {
    id: 'strategy',
    label: 'Stratégie',
    description: 'Frameworks consulting, analyse sectorielle, business cases.',
    icon: '♟️',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    available: false,
  },
  {
    id: 'law',
    label: 'Droit des affaires',
    description: 'Droit des sociétés, contrats, propriété intellectuelle.',
    icon: '⚖️',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    available: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Brand management, growth, pricing, digital marketing.',
    icon: '📣',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    available: false,
  },
  {
    id: 'management',
    label: 'Management',
    description: 'Leadership, RH, gestion de projet, organisation.',
    icon: '🏛️',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
    available: false,
  },
];

const LearningHub = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: colors.background,
      minHeight: '100vh',
      fontFamily: font.family,
    }}>
      <Navigation />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px 64px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '48px', textAlign: 'center' as const }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: `${colors.accent}20`, borderRadius: radius.full,
            padding: '6px 16px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '14px' }}>✨</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: colors.accent }}>
              Choisir une discipline
            </span>
          </div>
          <h1 style={{
            fontSize: '36px', fontWeight: '800',
            color: colors.primary, margin: '0 0 12px 0',
            lineHeight: '1.2',
          }}>
            Que veux-tu apprendre ?
          </h1>
          <p style={{ fontSize: '16px', color: colors.textMuted, margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Choisis une discipline et entraîne-toi avec des questions conçues par des professionnels du secteur.
          </p>
        </div>

        {/* GRILLE */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => cat.available && navigate(`/learn/${cat.id}`)}
            />
          ))}
        </div>

        {/* FOOTER NOTE */}
        <div style={{
          marginTop: '48px', textAlign: 'center' as const,
          padding: '20px', backgroundColor: colors.surface,
          borderRadius: radius.lg, boxShadow: shadows.sm,
        }}>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
            🔒 Les disciplines verrouillées sont en cours de création.
            Rejoins la liste d'attente pour être notifié en premier.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── CARTE CATÉGORIE ───────────────────────────────────────────────────────────
const CategoryCard = ({
  category,
  onClick,
}: {
  category: Category;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: radius.xl,
        overflow: 'hidden',
        cursor: category.available ? 'pointer' : 'default',
        boxShadow: hovered && category.available ? shadows.lg : shadows.sm,
        transform: hovered && category.available ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        position: 'relative' as const,
        opacity: category.available ? 1 : 0.72,
      }}
    >
      {/* BANDEAU COULEUR */}
      <div style={{
        background: category.gradient,
        padding: '28px 24px 20px',
        position: 'relative' as const,
      }}>
        {/* Icône */}
        <div style={{
          width: '52px', height: '52px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: radius.lg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', marginBottom: '12px',
          backdropFilter: 'blur(8px)',
        }}>
          {category.icon}
        </div>

        <h2 style={{
          fontSize: '20px', fontWeight: '800',
          color: 'white', margin: '0 0 4px 0',
        }}>
          {category.label}
        </h2>

        {/* Badge cadenas ou dispo */}
        {category.available ? (
          category.stats && (
            <span style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.8)',
              fontWeight: '600',
            }}>
              {category.stats}
            </span>
          )
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: radius.full,
            padding: '3px 10px',
          }}>
            <span style={{ fontSize: '11px' }}>🔒</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
              Bientôt disponible
            </span>
          </div>
        )}
      </div>

      {/* CORPS */}
      <div style={{
        backgroundColor: colors.surface,
        padding: '16px 24px 20px',
      }}>
        <p style={{
          fontSize: '13px', color: colors.textSecondary,
          margin: 0, lineHeight: '1.6',
        }}>
          {category.description}
        </p>

        {category.available && (
          <div style={{
            marginTop: '16px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{
              fontSize: '13px', fontWeight: '700', color: category.color,
            }}>
              Commencer
            </span>
            <span style={{ fontSize: '13px', color: category.color }}>→</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;