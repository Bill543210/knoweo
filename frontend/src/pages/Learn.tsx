import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';

interface Question {
  id: string;
  textFr: string;
  textEn: string;
  propositionsFr: { text: string; correct: boolean }[];
  propositionsEn: { text: string; correct: boolean }[];
  explanationFr: string;
  explanationEn: string;
  level: number;
  domainId: string;
}

interface Domain {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  icon: string;
  color: string;
}

// Niveaux sélectionnés par domaine : { [domainId]: number[] }
// ex: { "abc": [1,2], "def": [3] }
type DomainLevels = { [domainId: string]: number[] };

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

const XP_MAP: { [key: number]: number } = { 1: 5, 2: 10, 3: 20 };
const STREAK_BONUS: { [key: number]: number } = { 5: 10, 10: 25 };

const LEVEL_LABELS: { [key: number]: { label: string; color: string; short: string } } = {
  1: { label: 'Débutant',       color: '#22C55E', short: 'Déb' },
  2: { label: 'Intermédiaire',  color: '#F5A623', short: 'Int' },
  3: { label: 'Master',         color: '#EF4444', short: 'Mas' },
};

const Learn = () => {
  const navigate = useNavigate();
  const [domains, setDomains]                   = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains]   = useState<string[]>([]);
  // Pour chaque domaine sélectionné, quels niveaux sont cochés
  const [domainLevels, setDomainLevels]         = useState<DomainLevels>({});

  // Chrono
  const [timerEnabled, setTimerEnabled]         = useState(false);
  const [timerDuration, setTimerDuration]       = useState(30);
  const [timeLeft, setTimeLeft]                 = useState(30);
  const timerRef                                = useRef<NodeJS.Timeout | null>(null);

  // Session
  const [sessionStarted, setSessionStarted]     = useState(false);
  const [currentQuestion, setCurrentQuestion]   = useState<Question | null>(null);
  const [propositions, setPropositions]         = useState<{ text: string; correct: boolean }[]>([]);
  const [answerState, setAnswerState]           = useState<AnswerState>('unanswered');
  const [selectedIndex, setSelectedIndex]       = useState<number | null>(null);
  const [showExplanation, setShowExplanation]   = useState(false);
  const [currentLevel, setCurrentLevel]         = useState(1);
  const [correctStreak, setCorrectStreak]       = useState(0);
  const [totalCorrect, setTotalCorrect]         = useState(0);
  const [totalAnswered, setTotalAnswered]       = useState(0);
  const [sessionXP, setSessionXP]               = useState(0);
  const [seenIds, setSeenIds]                   = useState<string[]>([]);
  const [missedIds, setMissedIds]               = useState<string[]>([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [language]                              = useState('fr');
  const [showStreakBonus, setShowStreakBonus]   = useState<number | null>(null);
  const [noMoreQuestions, setNoMoreQuestions]   = useState(false);

  // ── Chargement des domaines ───────────────────────────────
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await api.get('/domains');
        setDomains(res.data);
      } catch (err) {
        console.error('Erreur chargement domaines:', err);
      }
    };
    fetchDomains();
  }, []);

  // ── Chrono : démarre quand une nouvelle question arrive ───
  useEffect(() => {
    if (!timerEnabled || !sessionStarted || answerState !== 'unanswered' || isLoading || !currentQuestion) return;
    setTimeLeft(timerDuration);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Temps écoulé → force mauvaise réponse
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, timerEnabled, sessionStarted, isLoading]);

  // Arrête le chrono dès qu'on répond
  useEffect(() => {
    if (answerState !== 'unanswered' && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [answerState]);

  const handleTimeUp = () => {
    if (answerState !== 'unanswered' || !currentQuestion) return;
    // Force la sélection de la première mauvaise réponse
    const wrongIndex = propositions.findIndex(p => !p.correct);
    if (wrongIndex !== -1) handleAnswer(wrongIndex, true);
  };

  // ── Helpers niveaux ───────────────────────────────────────
  const toggleDomain = (domainId: string) => {
    setSelectedDomains(prev => {
      if (prev.includes(domainId)) {
        // Désélectionne domaine ET ses niveaux
        const next = { ...domainLevels };
        delete next[domainId];
        setDomainLevels(next);
        return prev.filter(id => id !== domainId);
      } else {
        // Sélectionne domaine avec niveau 1 par défaut
        setDomainLevels(prev2 => ({ ...prev2, [domainId]: [1] }));
        return [...prev, domainId];
      }
    });
  };

  const toggleLevel = (domainId: string, level: number) => {
    setDomainLevels(prev => {
      const current = prev[domainId] || [];
      const hasLevel = current.includes(level);
      // Empêche de tout décocher (au moins 1 niveau requis)
      if (hasLevel && current.length === 1) return prev;
      return {
        ...prev,
        [domainId]: hasLevel ? current.filter(l => l !== level) : [...current, level],
      };
    });
  };

  // Construit la liste de (domainId, level) à envoyer au backend
  // On crée des "paires" pour requêter chaque combo séparément
  const getSessionParams = () => {
    // Tous les domainIds sélectionnés
    const domainIds = selectedDomains;
    // Niveau de départ = le plus bas parmi tous les niveaux choisis
    const allLevels = selectedDomains.flatMap(id => domainLevels[id] || [1]);
    const startLevel = Math.min(...allLevels);
    return { domainIds, startLevel };
  };

  // ── Fetch question ────────────────────────────────────────
  const shufflePropositions = (props: { text: string; correct: boolean }[]) =>
    [...props].sort(() => Math.random() - 0.5);

  const fetchNextQuestion = useCallback(async (
    domainIds: string[],
    level: number,
    seen: string[],
    missed: string[],
  ) => {
    setIsLoading(true);
    setAnswerState('unanswered');
    setSelectedIndex(null);
    setShowExplanation(false);

    // Filtre les domainIds qui acceptent ce niveau
    const eligibleDomains = domainIds.filter(id => (domainLevels[id] || [1]).includes(level));
    // Si aucun domaine n'accepte ce niveau, on prend quand même tous les domaines
    const queryDomains = eligibleDomains.length > 0 ? eligibleDomains : domainIds;

    try {
      const params = new URLSearchParams({
        domainIds: queryDomains.join(','),
        level: level.toString(),
        seenIds: seen.join(','),
        missedIds: missed.join(','),
      });
      const res = await api.get(`/questions/session?${params}`);
      if (!res.data) {
        setNoMoreQuestions(true);
        return;
      }
      setCurrentQuestion(res.data);
      const props = language === 'fr' ? res.data.propositionsFr : res.data.propositionsEn;
      setPropositions(shufflePropositions(props));
    } catch {
      setNoMoreQuestions(true);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, domainLevels]);

  // ── Démarrage session ─────────────────────────────────────
  const startSession = async () => {
    if (selectedDomains.length === 0) return;
    const { domainIds, startLevel } = getSessionParams();
    setSessionStarted(true);
    setCurrentLevel(startLevel);
    setCorrectStreak(0);
    setTotalCorrect(0);
    setTotalAnswered(0);
    setSessionXP(0);
    setSeenIds([]);
    setMissedIds([]);
    setNoMoreQuestions(false);
    await fetchNextQuestion(domainIds, startLevel, [], []);
  };

  // ── Réponse ───────────────────────────────────────────────
  const handleAnswer = async (index: number, forcedByTimer = false) => {
    if (answerState !== 'unanswered' || !currentQuestion) return;

    const isCorrect = !forcedByTimer && propositions[index].correct;
    setSelectedIndex(index);
    setAnswerState(isCorrect ? 'correct' : 'incorrect');

    const newSeen = [...seenIds, currentQuestion.id];
    setSeenIds(newSeen);

    let newMissed = [...missedIds];
    let newStreak = correctStreak;
    let newLevel  = currentLevel;
    let xpGained  = 0;

    // Niveaux autorisés pour le domaine courant
    const allowedLevels = domainLevels[currentQuestion.domainId] || [1, 2, 3];
    const minLevel = Math.min(...allowedLevels);
    const maxLevel = Math.max(...allowedLevels);

    if (isCorrect) {
      newStreak = correctStreak + 1;
      xpGained  = XP_MAP[currentQuestion.level] || 5;

      if (STREAK_BONUS[newStreak]) {
        xpGained += STREAK_BONUS[newStreak];
        setShowStreakBonus(STREAK_BONUS[newStreak]);
        setTimeout(() => setShowStreakBonus(null), 2000);
      }

      // Level up (dans les bornes choisies par l'utilisateur)
      if (newStreak >= 5 && currentLevel < maxLevel) {
        newLevel = Math.min(currentLevel + 1, maxLevel);
      }
      setTotalCorrect(prev => prev + 1);
    } else {
      newStreak = 0;
      // Level down (dans les bornes choisies)
      newLevel = Math.max(currentLevel - 1, minLevel);
      if (!newMissed.includes(currentQuestion.id)) {
        newMissed = [...newMissed, currentQuestion.id];
      }
      setMissedIds(newMissed);
      setShowExplanation(false);
    }

    setCorrectStreak(newStreak);
    setCurrentLevel(newLevel);
    setSessionXP(prev => prev + xpGained);
    setTotalAnswered(prev => prev + 1);

    try {
      await api.post('/user-progress/answer', { isCorrect, xp: xpGained });
    } catch {}
  };

  const handleNext = () => {
    fetchNextQuestion(selectedDomains, currentLevel, seenIds, missedIds);
  };

  const getQuestionText = (q: Question) => language === 'fr' ? q.textFr : q.textEn;
  const getExplanation  = (q: Question) => language === 'fr' ? q.explanationFr : q.explanationEn;
  const getLevelInfo    = (level: number) => LEVEL_LABELS[level] || LEVEL_LABELS[1];

  // Vérifie si au moins un domaine a au moins un niveau coché
  const canStart = selectedDomains.length > 0 &&
    selectedDomains.every(id => (domainLevels[id] || []).length > 0);

  // ── ÉCRAN DE CONFIGURATION ────────────────────────────────
  if (!sessionStarted) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
        <Navigation />
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '88px 24px 48px 24px' }}>

          {/* TITRE */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>
              📚 Mode Infini
            </h1>
            <p style={{ fontSize: '15px', color: colors.textMuted, margin: 0 }}>
              Choisis tes domaines, tes niveaux, et configure le chrono si tu veux t'entraîner en conditions réelles.
            </p>
          </div>

          {/* SÉLECTION DOMAINES + NIVEAUX */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '28px', boxShadow: shadows.sm, marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 20px 0' }}>
              1. Choisis tes domaines et niveaux
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '10px' }}>
              {domains.map(domain => {
                const isSelected = selectedDomains.includes(domain.id);
                const levels     = domainLevels[domain.id] || [];
                return (
                  <div key={domain.id} style={{
                    border: `2px solid ${isSelected ? domain.color : colors.border}`,
                    borderRadius: radius.lg,
                    backgroundColor: isSelected ? `${domain.color}08` : 'white',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}>
                    {/* Ligne domaine */}
                    <button
                      style={{
                        width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                        textAlign: 'left' as 'left',
                      }}
                      onClick={() => toggleDomain(domain.id)}
                    >
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>{domain.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: colors.primary, flex: 1 }}>
                        {language === 'fr' ? domain.nameFr : domain.nameEn}
                      </span>
                      {isSelected && levels.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {levels.sort().map(l => (
                            <span key={l} style={{
                              fontSize: '10px', fontWeight: '700',
                              color: LEVEL_LABELS[l].color,
                              backgroundColor: `${LEVEL_LABELS[l].color}20`,
                              padding: '2px 7px', borderRadius: radius.full,
                            }}>
                              {LEVEL_LABELS[l].short}
                            </span>
                          ))}
                        </div>
                      )}
                      <span style={{
                        fontSize: '18px', color: isSelected ? domain.color : colors.textMuted,
                        flexShrink: 0, marginLeft: '4px',
                      }}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </button>

                    {/* Sélecteur de niveaux (visible seulement si domaine sélectionné) */}
                    {isSelected && (
                      <div style={{
                        borderTop: `1px solid ${domain.color}30`,
                        padding: '10px 16px 14px 52px',
                        display: 'flex', gap: '8px', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', color: colors.textMuted, marginRight: '4px' }}>
                          Niveaux :
                        </span>
                        {([1, 2, 3] as const).map(lvl => {
                          const active = levels.includes(lvl);
                          return (
                            <button
                              key={lvl}
                              onClick={() => toggleLevel(domain.id, lvl)}
                              style={{
                                padding: '5px 14px', borderRadius: radius.full, cursor: 'pointer',
                                border: `2px solid ${LEVEL_LABELS[lvl].color}`,
                                backgroundColor: active ? LEVEL_LABELS[lvl].color : 'white',
                                color: active ? 'white' : LEVEL_LABELS[lvl].color,
                                fontSize: '12px', fontWeight: '700',
                                transition: 'all 0.15s',
                              }}
                            >
                              {LEVEL_LABELS[lvl].label}
                            </button>
                          );
                        })}
                        <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: '4px' }}>
                          (au moins 1 requis)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedDomains.length > 0 && (
              <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: colors.accentLight, borderRadius: radius.md }}>
                <p style={{ fontSize: '13px', color: colors.primary, margin: 0, fontWeight: '600' }}>
                  {selectedDomains.length} domaine{selectedDomains.length > 1 ? 's' : ''} sélectionné{selectedDomains.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* CHRONO */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '24px 28px', boxShadow: shadows.sm, marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              2. Chronomètre (optionnel)
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as 'wrap' }}>

              {/* Toggle on/off */}
              <button
                onClick={() => setTimerEnabled(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 18px', borderRadius: radius.full, cursor: 'pointer',
                  border: `2px solid ${timerEnabled ? colors.primary : colors.border}`,
                  backgroundColor: timerEnabled ? colors.primary : 'white',
                  color: timerEnabled ? 'white' : colors.textSecondary,
                  fontSize: '14px', fontWeight: '700', transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '16px' }}>⏱️</span>
                {timerEnabled ? 'Chrono activé' : 'Activer le chrono'}
              </button>

              {/* Durée (visible seulement si activé) */}
              {timerEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '600' }}>
                    Durée par question :
                  </span>
                  {[15, 30, 45, 60].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setTimerDuration(sec)}
                      style={{
                        padding: '6px 14px', borderRadius: radius.full, cursor: 'pointer',
                        border: `2px solid ${timerDuration === sec ? colors.primary : colors.border}`,
                        backgroundColor: timerDuration === sec ? colors.primary : 'white',
                        color: timerDuration === sec ? 'white' : colors.textSecondary,
                        fontSize: '13px', fontWeight: '700', transition: 'all 0.15s',
                      }}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              )}
            </div>
            {timerEnabled && (
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '12px 0 0 0' }}>
                ⚡ Si le temps s'écoule sans réponse, la question est comptée comme incorrecte.
              </p>
            )}
          </div>

          {/* BOUTON LANCER */}
          <button
            style={{
              width: '100%', padding: '16px', borderRadius: radius.lg, border: 'none',
              backgroundColor: canStart ? colors.primary : colors.border,
              color: 'white', fontSize: '16px', fontWeight: '700',
              cursor: canStart ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
            onClick={startSession}
            disabled={!canStart}
          >
            ▶ Lancer la session
          </button>
        </div>
      </div>
    );
  }

  // ── ÉCRAN FIN DE SESSION ──────────────────────────────────
  if (noMoreQuestions) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
        <Navigation />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '88px 24px', textAlign: 'center' as 'center' }}>
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '48px', boxShadow: shadows.md }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>🏆</p>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>
              Session terminée !
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 32px 0' }}>
              Tu as répondu à toutes les questions disponibles dans ces domaines.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Questions répondues', value: totalAnswered,   icon: '❓' },
                { label: 'Bonnes réponses',      value: totalCorrect,   icon: '✅' },
                { label: 'Taux de réussite',      value: `${totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0}%`, icon: '🎯' },
                { label: 'XP gagnés',             value: `+${sessionXP}`, icon: '⭐' },
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px' }}>
                  <p style={{ fontSize: '24px', margin: '0 0 4px 0' }}>{stat.icon}</p>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0' }}>{stat.value}</p>
                  <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{ flex: 1, padding: '14px', borderRadius: radius.md, border: `2px solid ${colors.border}`, backgroundColor: 'white', color: colors.primary, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => { setSessionStarted(false); setSelectedDomains([]); setDomainLevels({}); }}
              >
                Changer de domaine
              </button>
              <button
                style={{ flex: 1, padding: '14px', borderRadius: radius.md, border: 'none', backgroundColor: colors.primary, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => navigate('/dashboard')}
              >
                Voir mon tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCRAN QUIZ ────────────────────────────────────────────
  const levelInfo = getLevelInfo(currentLevel);

  // Calcul couleur chrono
  const timerPercent = timerEnabled ? (timeLeft / timerDuration) * 100 : 100;
  const timerColor   = timerPercent > 50 ? '#22C55E' : timerPercent > 25 ? '#F5A623' : '#EF4444';

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navigation />

      {/* STREAK BONUS TOAST */}
      {showStreakBonus && (
        <div style={{
          position: 'fixed' as 'fixed', top: '80px', right: '24px',
          backgroundColor: colors.accent, borderRadius: radius.lg,
          padding: '14px 20px', zIndex: 999, boxShadow: shadows.lg,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '24px' }}>🔥</span>
          <p style={{ color: colors.primary, fontWeight: '800', fontSize: '16px', margin: 0 }}>
            Bonus streak +{showStreakBonus} XP !
          </p>
        </div>
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 24px 48px 24px' }}>

        {/* BARRE DE STATS */}
        <div style={{
          backgroundColor: colors.surface, borderRadius: radius.lg,
          padding: '14px 20px', marginBottom: '16px', boxShadow: shadows.sm,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap' as 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' as 'wrap' }}>
            {[
              { value: totalAnswered, label: 'Répondues', color: colors.primary },
              { value: totalCorrect,  label: 'Correctes',  color: colors.success },
              { value: `+${sessionXP}`, label: 'XP',      color: colors.accent },
              { value: `${correctStreak} 🔥`, label: 'Série', color: '#EF4444' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' as 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px', fontWeight: '700', color: levelInfo.color,
              backgroundColor: `${levelInfo.color}20`, padding: '4px 12px', borderRadius: radius.full,
            }}>
              {levelInfo.label}
            </span>
            <button
              style={{ fontSize: '12px', color: colors.textMuted, background: 'none', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '4px 12px', cursor: 'pointer' }}
              onClick={() => { setSessionStarted(false); setSelectedDomains([]); setDomainLevels({}); }}
            >
              Arrêter
            </button>
          </div>
        </div>

        {/* BARRE CHRONO */}
        {timerEnabled && !isLoading && currentQuestion && answerState === 'unanswered' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>⏱️ Temps restant</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: timerColor }}>{timeLeft}s</span>
            </div>
            <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: radius.full,
                backgroundColor: timerColor,
                width: `${timerPercent}%`,
                transition: 'width 1s linear, background-color 0.3s',
              }} />
            </div>
          </div>
        )}

        {/* QUESTION CARD */}
        {isLoading ? (
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '60px', textAlign: 'center' as 'center', boxShadow: shadows.sm }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>⏳</p>
            <p style={{ color: colors.textMuted }}>Chargement de la question...</p>
          </div>
        ) : currentQuestion ? (
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '32px', boxShadow: shadows.sm }}>

            <p style={{ fontSize: '18px', fontWeight: '700', color: colors.primary, margin: '0 0 28px 0', lineHeight: '1.5' }}>
              {getQuestionText(currentQuestion)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' as 'column', gap: '10px', marginBottom: '24px' }}>
              {propositions.map((prop, index) => {
                let bgColor     = 'white';
                let borderColor = colors.border;
                let textColor   = colors.textPrimary;
                let icon        = null;

                if (answerState !== 'unanswered') {
                  if (prop.correct) {
                    bgColor = '#DCFCE7'; borderColor = '#22C55E'; textColor = '#166534'; icon = '✅';
                  } else if (index === selectedIndex && !prop.correct) {
                    bgColor = '#FEE2E2'; borderColor = '#EF4444'; textColor = '#991B1B'; icon = '❌';
                  }
                }

                return (
                  <button
                    key={index}
                    style={{
                      padding: '14px 16px', borderRadius: radius.md,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: bgColor, color: textColor,
                      fontSize: '15px', fontWeight: '500',
                      cursor: answerState === 'unanswered' ? 'pointer' : 'default',
                      textAlign: 'left' as 'left', transition: 'all 0.15s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    onClick={() => handleAnswer(index)}
                    disabled={answerState !== 'unanswered'}
                  >
                    <span>{prop.text}</span>
                    {icon && <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>}
                  </button>
                );
              })}
            </div>

            {answerState !== 'unanswered' && (
              <div style={{
                padding: '16px 20px', borderRadius: radius.md, marginBottom: '16px',
                backgroundColor: answerState === 'correct' ? '#DCFCE7' : '#FEE2E2',
                border: `1px solid ${answerState === 'correct' ? '#22C55E' : '#EF4444'}`,
              }}>
                <p style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', color: answerState === 'correct' ? '#166534' : '#991B1B' }}>
                  {answerState === 'correct'
                    ? `✅ Bonne réponse ! +${XP_MAP[currentQuestion.level]} XP`
                    : timeLeft === 0 && timerEnabled
                      ? '⏰ Temps écoulé !'
                      : '❌ Mauvaise réponse'}
                </p>
                {answerState === 'incorrect' && (
                  <button
                    style={{ fontSize: '13px', color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    onClick={() => setShowExplanation(!showExplanation)}
                  >
                    {showExplanation ? "Masquer l'explication" : 'Voir l\'explication ▼'}
                  </button>
                )}
              </div>
            )}

            {showExplanation && currentQuestion && answerState === 'incorrect' && (
              <div style={{
                padding: '16px 20px', borderRadius: radius.md, marginBottom: '16px',
                backgroundColor: '#FFF7ED', border: `1px solid #F5A623`,
              }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: colors.primary, margin: '0 0 8px 0' }}>💡 Explication</p>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                  {getExplanation(currentQuestion)}
                </p>
              </div>
            )}

            {answerState !== 'unanswered' && (
              <button
                style={{ width: '100%', padding: '14px', borderRadius: radius.md, border: 'none', backgroundColor: colors.primary, color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
                onClick={handleNext}
              >
                Question suivante →
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Learn;