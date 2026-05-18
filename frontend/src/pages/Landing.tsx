import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  ink:     '#0F1923',
  inkSoft: '#3D4F5C',
  inkMute: '#8899A6',
  cream:   '#FAFAF8',
  paper:   '#F2F1EE',
  border:  '#E4E2DC',
  gold:    '#F5A623',
  goldDeep:'#D4891A',
  violet:  '#5B5BD6',
  mint:    '#17B890',
  rose:    '#E8445A',
  white:   '#FFFFFF',
};

// ── DONNÉES ───────────────────────────────────────────────────────────────────

const DOMAINS = [
  { icon: '🤝', name: 'M&A',                  questions: 570, color: T.violet, active: true  },
  { icon: '📊', name: 'Comptabilité',          questions: 50,  color: T.mint,   active: true  },
  { icon: '💼', name: 'Private Equity',        questions: 0,   color: T.gold,   active: false },
  { icon: '📈', name: 'Marchés Financiers',    questions: 0,   color: T.rose,   active: false },
  { icon: '🌍', name: 'Économie',              questions: 0,   color: T.mint,   active: false },
  { icon: '🤖', name: 'Data & IA',             questions: 0,   color: T.violet, active: false },
  { icon: '♟️', name: 'Stratégie',             questions: 0,   color: T.gold,   active: false },
  { icon: '⚖️', name: 'Droit',                 questions: 0,   color: T.rose,   active: false },
];

const MODES = [
  { icon: '♾️', name: 'Infini',     desc: 'Niveau adaptatif en temps réel',           color: T.violet },
  { icon: '🎯', name: 'Révision',   desc: 'Répétition espacée sur tes lacunes',        color: T.mint   },
  { icon: '🎙️', name: 'Entretien', desc: 'Questions techniques typiques d\'entretien, chrono, verdict final', color: T.gold },
  { icon: '📝', name: 'Examen',     desc: 'Test complet, corrigé exhaustif',           color: T.rose   },
];

const QUESTIONS_PREVIEW = [
  { q: 'Qu\'est-ce que le WACC et comment l\'interprète-t-on ?',         domain: 'M&A',          level: 1 },
  { q: 'Quelle différence entre EBITDA et Free Cash Flow ?',              domain: 'Comptabilité',  level: 1 },
  { q: 'Comment passe-t-on du résultat net au free cash flow ?',          domain: 'Comptabilité',  level: 2 },
  { q: 'Quelles sont les 3 méthodes de valorisation en M&A ?',            domain: 'M&A',          level: 2 },
  { q: 'Qu\'est-ce qu\'une clause MAC et quand s\'applique-t-elle ?',     domain: 'M&A',          level: 3 },
  { q: 'Qu\'est-ce que la décomposition Du Pont du ROE ?',                domain: 'Comptabilité',  level: 3 },
];

// ── HOOK SCROLL ───────────────────────────────────────────────────────────────

const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
};

// ── HOOK COUNTER ANIMÉ ────────────────────────────────────────────────────────

const useCounter = (target: number, duration = 1500, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

// ── STYLES GLOBAUX ────────────────────────────────────────────────────────────

const injectStyles = () => {
  if (document.getElementById('knoweo-landing-styles')) return;
  const style = document.createElement('style');
  style.id = 'knoweo-landing-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .knoweo-landing { background: ${T.cream}; font-family: 'DM Sans', sans-serif; color: ${T.ink}; overflow-x: hidden; }

    .kl-display { font-family: 'Playfair Display', serif; }

    .kl-fade-up {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .kl-fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .kl-question-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      cursor: default;
    }
    .kl-question-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(15,25,35,0.12);
      border-color: ${T.gold} !important;
    }

    .kl-mode-card {
      transition: all 0.25s ease;
      cursor: default;
    }
    .kl-mode-card:hover {
      transform: scale(1.03);
      box-shadow: 0 16px 40px rgba(15,25,35,0.1);
    }

    .kl-domain-card {
      transition: all 0.2s ease;
    }
    .kl-domain-card:hover {
      transform: translateY(-2px);
    }

    .kl-cta-btn {
      transition: all 0.2s ease;
    }
    .kl-cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(245,166,35,0.4) !important;
    }

    .kl-secondary-btn {
      transition: all 0.2s ease;
    }
    .kl-secondary-btn:hover {
      background: ${T.ink} !important;
      color: ${T.cream} !important;
    }

    .kl-nav-link {
      transition: color 0.15s;
    }
    .kl-nav-link:hover {
      color: ${T.ink} !important;
    }

    .kl-ticker {
      animation: ticker 25s linear infinite;
      display: flex;
      gap: 48px;
      white-space: nowrap;
    }
    @keyframes ticker {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    .kl-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .kl-float {
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
  `;
  document.head.appendChild(style);
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [activeMode, setActiveMode] = useState(0);

  useEffect(() => {
    injectStyles();
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveMode(p => (p + 1) % MODES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const isNavSolid = scrollY > 60;

  return (
    <div className="knoweo-landing">

      {/* ── NAVIGATION ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: '64px',
        backgroundColor: isNavSolid ? T.white : 'transparent',
        borderBottom: isNavSolid ? `1px solid ${T.border}` : 'none',
        boxShadow: isNavSolid ? '0 1px 20px rgba(15,25,35,0.06)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: T.gold, fontFamily: 'DM Sans, sans-serif' }}>K</span>
          </div>
          <span className="kl-display" style={{ fontSize: '20px', fontWeight: '700', color: T.ink, letterSpacing: '-0.5px' }}>
            Knoweo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="kl-nav-link"
            onClick={() => navigate('/careers')}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'none', color: T.inkMute, fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Métiers
        </button>
        <button className="kl-nav-link"
            onClick={() => navigate('/login')}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'none', color: T.inkMute, fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Connexion
        </button>
        <button className="kl-cta-btn"
            onClick={() => navigate('/register')}
            style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: T.ink, color: T.white, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 12px rgba(15,25,35,0.2)' }}>
            Commencer — Gratuit
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <HeroSection navigate={navigate} activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* ── TICKER ── */}
      <TickerSection />

      {/* ── PROBLÈME ── */}
      <ProblemSection />

      {/* ── MODES ── */}
      <ModesSection activeMode={activeMode} setActiveMode={setActiveMode} navigate={navigate} />

      {/* ── QUESTIONS PREVIEW ── */}
      <QuestionsSection navigate={navigate} />

      {/* ── DOMAINES ── */}
      <DomainsSection navigate={navigate} />

      {/* ── CTA FINAL ── */}
      <CTASection navigate={navigate} />

      {/* ── FOOTER ── */}
      <FooterSection navigate={navigate} />

    </div>
  );
};

// ── HERO ──────────────────────────────────────────────────────────────────────

const HeroSection = ({ navigate, activeMode, setActiveMode }: any) => {
  const { ref: statsRef, inView: statsVisible } = useInView(0.3);
  const questionsCount = useCounter(620, 1800, statsVisible);
  const domainsCount   = useCounter(8,   1200, statsVisible);

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden' }}>

      {/* Background décoratif */}
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '3%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,91,214,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: T.paper, border: `1px solid ${T.border}`, borderRadius: '100px', padding: '6px 14px', marginBottom: '32px' }}>
        <span className="kl-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: T.mint, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: T.inkSoft, letterSpacing: '0.2px' }}>
          Finance · Data · Stratégie · Droit · Et bien plus
        </span>
      </div>

      {/* Titre principal */}
      <h1 className="kl-display" style={{
        fontSize: 'clamp(44px, 7vw, 88px)',
        fontWeight: '900',
        color: T.ink,
        textAlign: 'center',
        lineHeight: '1.0',
        letterSpacing: '-3px',
        maxWidth: '900px',
        marginBottom: '24px',
      }}>
        L'apprentissage
        <br />
        <span style={{ color: T.gold, fontStyle: 'italic' }}>qui reste.</span>
      </h1>

      {/* Sous-titre */}
      <p style={{
        fontSize: 'clamp(16px, 2vw, 19px)',
        color: T.inkSoft,
        textAlign: 'center',
        maxWidth: '520px',
        lineHeight: '1.65',
        marginBottom: '40px',
        fontWeight: '400',
      }}>
        Knoweo s'adapte à ton niveau, traque tes lacunes et te repose ce que tu ne maîtrises pas encore — jusqu'à ce que ça rentre vraiment.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '64px' }}>
        <button className="kl-cta-btn"
          onClick={() => navigate('/register')}
          style={{ padding: '16px 36px', borderRadius: '10px', border: 'none', backgroundColor: T.gold, color: T.ink, fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 8px 24px rgba(245,166,35,0.3)', letterSpacing: '-0.2px' }}>
          Commencer gratuitement →
        </button>
        <button className="kl-secondary-btn"
          onClick={() => navigate('/login')}
          style={{ padding: '16px 32px', borderRadius: '10px', border: `2px solid ${T.border}`, backgroundColor: 'transparent', color: T.inkSoft, fontSize: '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          J'ai déjà un compte
        </button>
      </div>

      {/* Stats animées */}
      <div ref={statsRef} style={{ display: 'flex', gap: '0', borderRadius: '14px', border: `1px solid ${T.border}`, overflow: 'hidden', backgroundColor: T.white, boxShadow: '0 4px 24px rgba(15,25,35,0.06)' }}>
        {[
          { value: questionsCount + '+', label: 'Questions expertisées',    border: true  },
          { value: domainsCount,         label: 'Domaines disponibles',      border: true  },
          { value: '4',                  label: 'Modes d\'apprentissage',    border: false },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px 32px', borderRight: s.border ? `1px solid ${T.border}` : 'none', textAlign: 'center' }}>
            <p className="kl-display" style={{ fontSize: '32px', fontWeight: '700', color: T.ink, margin: '0 0 2px', letterSpacing: '-1px' }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: T.inkMute, margin: 0, fontWeight: '500' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mode actif flottant */}
      <div style={{ marginTop: '48px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {MODES.map((m, i) => (
          <div key={i}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', border: `1px solid ${i === 0 ? T.violet + '40' : T.border}`, backgroundColor: i === 0 ? T.violet + '08' : T.white, transition: 'all 0.3s' }}>
            <span style={{ fontSize: '14px' }}>{m.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: T.inkSoft }}>{m.name}</span>
          </div>
        ))}
      </div>

    </section>
  );
};

// ── TICKER ────────────────────────────────────────────────────────────────────

const TickerSection = () => {
  const items = ['M&A', 'Private Equity', 'Comptabilité', 'Marchés Financiers', 'Data Science', 'Économie', 'Stratégie', 'IBD', 'Project Finance', 'Gestion d\'Actifs', 'Droit des affaires', 'Machine Learning'];
  const doubled = [...items, ...items];

  return (
    <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, backgroundColor: T.paper, padding: '14px 0', overflow: 'hidden' }}>
      <div className="kl-ticker">
        {doubled.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '48px', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: T.inkMute, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {item}
            </span>
            <span style={{ color: T.gold, fontSize: '10px' }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PROBLÈME ──────────────────────────────────────────────────────────────────

const ProblemSection = () => {
  const { ref, inView } = useInView();

  const problems = [
    { num: '01', title: 'Dispersé', desc: 'Les ressources existent, mais elles sont éparpillées entre PDFs, vidéos et fiches mal organisées.' },
    { num: '02', title: 'Sans feedback', desc: 'Tu lis, tu surlignes, tu "crois" maîtriser. Mais personne ne te dit vraiment où sont tes lacunes.' },
    { num: '03', title: 'Hors pression', desc: 'Les entretiens techniques sont redoutables. Knoweo te prépare sur les concepts exacts qui sont posés en entretien, sous contrainte de temps.' },
  ];

  return (
    <section style={{ padding: '120px 24px', backgroundColor: T.ink }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div ref={ref} className={`kl-fade-up ${inView ? 'visible' : ''}`} style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: T.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Le problème
          </p>
          <h2 className="kl-display" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '700', color: T.white, lineHeight: '1.1', letterSpacing: '-1.5px', maxWidth: '600px' }}>
            Apprendre sérieusement,<br />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>c'est souvent chaotique.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          {problems.map((p, i) => (
            <div key={i}
              className={`kl-fade-up ${inView ? 'visible' : ''}`}
              style={{ padding: '40px 36px', backgroundColor: T.ink, transition: `opacity 0.7s ${i * 0.15}s, transform 0.7s ${i * 0.15}s` }}>
              <div className="kl-display" style={{ fontSize: '56px', fontWeight: '900', color: 'rgba(255,255,255,0.06)', letterSpacing: '-3px', marginBottom: '24px', lineHeight: 1 }}>
                {p.num}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: T.white, marginBottom: '12px', letterSpacing: '-0.5px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6', margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div className={`kl-fade-up ${inView ? 'visible' : ''}`}
          style={{ marginTop: '32px', padding: '32px 36px', borderRadius: '16px', backgroundColor: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <p className="kl-display" style={{ fontSize: '22px', fontWeight: '700', color: T.ink, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Knoweo résout les trois.
            </p>
            <p style={{ fontSize: '15px', color: T.inkSoft, margin: 0 }}>
              Contenu structuré · Algorithme adaptatif · Simulation réelle
            </p>
          </div>
          <button
            onClick={() => {}}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: T.ink, color: T.white, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
            Voir comment →
          </button>
        </div>
      </div>
    </section>
  );
};

// ── MODES ─────────────────────────────────────────────────────────────────────

const ModesSection = ({ activeMode, setActiveMode, navigate }: any) => {
  const { ref, inView } = useInView();

  return (
    <section style={{ padding: '120px 24px', backgroundColor: T.cream }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div ref={ref} className={`kl-fade-up ${inView ? 'visible' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: T.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
              4 modes d'apprentissage
            </p>
            <h2 className="kl-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '700', color: T.ink, letterSpacing: '-1.5px', lineHeight: '1.1' }}>
              Un outil pour<br />chaque objectif.
            </h2>
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: '12px 24px', borderRadius: '8px', border: `2px solid ${T.border}`, backgroundColor: 'transparent', color: T.inkSoft, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
            Tout explorer →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {MODES.map((mode, i) => (
            <div key={i}
              className={`kl-mode-card kl-fade-up ${inView ? 'visible' : ''}`}
              onClick={() => setActiveMode(i)}
              style={{
                padding: '32px',
                borderRadius: '16px',
                border: `2px solid ${activeMode === i ? mode.color + '40' : T.border}`,
                backgroundColor: activeMode === i ? mode.color + '06' : T.white,
                transitionDelay: `${i * 0.1}s`,
                position: 'relative',
                overflow: 'hidden',
              }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '11px', fontWeight: '700', color: activeMode === i ? mode.color : T.inkMute, backgroundColor: activeMode === i ? mode.color + '15' : T.paper, padding: '3px 10px', borderRadius: '100px' }}>
                {activeMode === i ? 'Actif' : 'Mode'}
              </div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{mode.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: T.ink, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                Mode {mode.name}
              </h3>
              <p style={{ fontSize: '14px', color: T.inkSoft, margin: 0, lineHeight: '1.55' }}>
                {mode.desc}
              </p>
              <div style={{ marginTop: '20px', height: '3px', borderRadius: '100px', backgroundColor: T.border, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: activeMode === i ? '100%' : '0%', backgroundColor: mode.color, transition: 'width 2.8s linear' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── QUESTIONS PREVIEW ─────────────────────────────────────────────────────────

const QuestionsSection = ({ navigate }: any) => {
  const { ref, inView } = useInView();
  const [flipped, setFlipped] = useState<number | null>(null);

  const ANSWERS = [
    'Le WACC est le taux de rendement moyen exigé par tous les apporteurs de capitaux. Il s\'utilise comme taux d\'actualisation dans un DCF.',
    'L\'EBITDA mesure la rentabilité opérationnelle avant investissements. Le FCF représente le cash réellement disponible après capex et variation du BFR.',
    'Résultat net + Amortissements - Variation du BFR - Capex. C\'est le pont entre comptabilité et flux de trésorerie.',
    'DCF (valeur intrinsèque), Comparables boursiers (multiples de pairs cotés), Transactions comparables (multiples de deals récents).',
    'Material Adverse Change — clause contractuelle permettant à l\'acheteur de se retirer si un événement majeur affecte la cible avant closing.',
    'ROE = Marge nette × Rotation actifs × Levier financier. Permet d\'identifier si la rentabilité vient de l\'opérationnel ou de l\'endettement.',
  ];

  return (
    <section style={{ padding: '120px 24px', backgroundColor: T.paper, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div ref={ref} className={`kl-fade-up ${inView ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: T.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Aperçu des questions
          </p>
          <h2 className="kl-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '700', color: T.ink, letterSpacing: '-1.5px', marginBottom: '12px' }}>
            Des vraies questions.<br />De vraies explications.
          </h2>
          <p style={{ fontSize: '15px', color: T.inkSoft, maxWidth: '420px', margin: '0 auto' }}>
            Clique sur une question pour voir la réponse.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {QUESTIONS_PREVIEW.map((q, i) => (
            <div key={i}
              className={`kl-question-card kl-fade-up ${inView ? 'visible' : ''}`}
              onClick={() => setFlipped(flipped === i ? null : i)}
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: `1px solid ${flipped === i ? T.gold : T.border}`,
                backgroundColor: flipped === i ? T.gold + '06' : T.white,
                cursor: 'pointer',
                transitionDelay: `${i * 0.07}s`,
              }}>
              {flipped !== i ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: T.violet, backgroundColor: T.violet + '12', padding: '2px 8px', borderRadius: '100px' }}>
                        {q.domain}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: T.inkMute, backgroundColor: T.paper, padding: '2px 8px', borderRadius: '100px' }}>
                        {'⭐'.repeat(q.level)}
                      </span>
                    </div>
                    <span style={{ fontSize: '18px', color: T.inkMute, flexShrink: 0 }}>?</span>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: T.ink, lineHeight: '1.5', margin: 0 }}>
                    {q.q}
                  </p>
                  <p style={{ fontSize: '12px', color: T.inkMute, margin: '12px 0 0', fontStyle: 'italic' }}>
                    Cliquer pour voir la réponse →
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px' }}>✅</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: T.mint }}>Réponse</span>
                  </div>
                  <p style={{ fontSize: '14px', color: T.inkSoft, lineHeight: '1.6', margin: 0 }}>
                    {ANSWERS[i]}
                  </p>
                  <p style={{ fontSize: '12px', color: T.inkMute, margin: '12px 0 0', fontStyle: 'italic' }}>
                    ← Cliquer pour masquer
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={`kl-fade-up ${inView ? 'visible' : ''}`} style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', borderRadius: '10px', border: `2px solid ${T.ink}`, backgroundColor: 'transparent', color: T.ink, fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
            Accéder aux 620+ questions →
          </button>
        </div>
      </div>
    </section>
  );
};

// ── DOMAINES ──────────────────────────────────────────────────────────────────

const DomainsSection = ({ navigate }: any) => {
  const { ref, inView } = useInView();

  return (
    <section style={{ padding: '120px 24px', backgroundColor: T.cream }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div ref={ref} className={`kl-fade-up ${inView ? 'visible' : ''}`} style={{ marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: T.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Bibliothèque
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="kl-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '700', color: T.ink, letterSpacing: '-1.5px', lineHeight: '1.1' }}>
              Finance d'abord.<br />
              <span style={{ color: T.inkMute, fontStyle: 'italic' }}>Tout le reste arrive.</span>
            </h2>
            <p style={{ fontSize: '14px', color: T.inkMute, maxWidth: '320px', lineHeight: '1.6', textAlign: 'right' }}>
              Knoweo part de la finance et s'étend vers tous les domaines qui construisent une carrière ambitieuse.
            </p>
          </div>
        </div>

        {/* Finance — actifs */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: T.inkMute, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '4px' }}>
            Disponible maintenant
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {DOMAINS.filter(d => d.active).map((d, i) => (
              <div key={i}
                className="kl-domain-card"
                onClick={() => navigate('/register')}
                style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${T.border}`, backgroundColor: T.white, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,25,35,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{d.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: d.color, backgroundColor: d.color + '12', padding: '2px 8px', borderRadius: '100px' }}>
                    {d.questions}+ Q
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: T.ink, margin: 0 }}>{d.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div style={{ padding: '28px', borderRadius: '14px', border: `1px dashed ${T.border}`, backgroundColor: T.paper }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: T.inkMute, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Prochainement
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {DOMAINS.filter(d => !d.active).concat([
              { icon: '🌍', name: 'Économie',      color: T.mint,   active: false, questions: 0 },
              { icon: '🤖', name: 'Data & IA',     color: T.violet, active: false, questions: 0 },
              { icon: '♟️', name: 'Stratégie',     color: T.gold,   active: false, questions: 0 },
              { icon: '⚖️', name: 'Droit',         color: T.rose,   active: false, questions: 0 },
              { icon: '📣', name: 'Marketing',     color: T.mint,   active: false, questions: 0 },
            ]).slice(0, 8).map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '100px', backgroundColor: T.white, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: '14px' }}>{d.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: T.inkMute }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── CTA FINAL ────────────────────────────────────────────────────────────────

const CTASection = ({ navigate }: any) => {
  const { ref, inView } = useInView();

  return (
    <section style={{ padding: '40px 24px 80px', backgroundColor: T.cream }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div
          ref={ref}
          className={`kl-fade-up ${inView ? 'visible' : ''}`}
          style={{ borderRadius: '24px', backgroundColor: T.ink, padding: '72px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

          {/* Déco */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,91,214,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <p style={{ fontSize: '12px', fontWeight: '700', color: T.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Commence aujourd'hui
          </p>
          <h2 className="kl-display" style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: '900', color: T.white, margin: '0 0 16px', letterSpacing: '-2px', lineHeight: '1.05' }}>
            Gratuit.<br />
            <span style={{ color: T.gold, fontStyle: 'italic' }}>Sans engagement.</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', margin: '0 0 40px', lineHeight: '1.6' }}>
            Inscription en 30 secondes. Accès immédiat à 620+ questions.<br />
            Aucune carte bancaire requise.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="kl-cta-btn"
              onClick={() => navigate('/register')}
              style={{ padding: '18px 48px', borderRadius: '10px', border: 'none', backgroundColor: T.gold, color: T.ink, fontSize: '17px', fontWeight: '800', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 8px 32px rgba(245,166,35,0.3)', letterSpacing: '-0.3px' }}>
              Créer mon compte gratuit →
            </button>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '20px' }}>
            Déjà membre ?{' '}
            <button onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: T.gold, cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', fontWeight: '600' }}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ────────────────────────────────────────────────────────────────────

const FooterSection = ({ navigate }: any) => (
  <footer style={{ padding: '32px 48px', borderTop: `1px solid ${T.border}`, backgroundColor: T.cream, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '900', color: T.gold }}>K</span>
      </div>
      <span className="kl-display" style={{ fontSize: '16px', fontWeight: '700', color: T.ink }}>Knoweo</span>
    </div>
    <div style={{ display: 'flex', gap: '24px' }}>
      {[['Métiers', '/careers'], ['Connexion', '/login'], ['Inscription', '/register']].map(([l, p]) => (
        <button key={l} onClick={() => navigate(p)}
          style={{ background: 'none', border: 'none', color: T.inkMute, fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' }}>
          {l}
        </button>
      ))}
    </div>
    <p style={{ fontSize: '12px', color: T.inkMute, margin: 0 }}>© 2026 Knoweo</p>
  </footer>
);

export default Landing;
