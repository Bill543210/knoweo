import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { colors, shadows, radius, font } from '../styles';
import api from '../services/api';

// ── TYPES ─────────────────────────────────────────────────────────────────────

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

interface Comment {
  id: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  parentId: string | null;
  author: { id: string; firstName: string; lastName: string; photo?: string };
  replies: Comment[];
}

interface QuestionReactions {
  userReactions: { question: 'like' | 'dislike' | null; explanation: 'like' | 'dislike' | null };
  counts: { questionLikes: number; questionDislikes: number; explanationLikes: number; explanationDislikes: number };
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';
type DomainLevels = { [domainId: string]: number[] };
type QuizMode = 'infini' | 'revision' | 'examen' | 'entretien';

// ── CONSTANTES ────────────────────────────────────────────────────────────────

const XP_MAP: { [key: number]: number } = { 1: 5, 2: 10, 3: 20 };
const STREAK_BONUS: { [key: number]: number } = { 5: 10, 10: 25 };
const TIMER_XP_BONUS: { [key: number]: number } = { 15: 5, 30: 3, 45: 2, 60: 1 };

const LEVEL_LABELS: { [key: number]: { label: string; color: string; short: string } } = {
  1: { label: 'Débutant',      color: '#22C55E', short: 'Déb' },
  2: { label: 'Intermédiaire', color: '#F5A623', short: 'Int' },
  3: { label: 'Master',        color: '#EF4444', short: 'Mas' },
};

const ENCOURAGEMENTS = [
  '🔥 Tu es en feu !',
  '⚡ Incroyable !',
  '🎯 Parfait !',
  '🚀 Continue comme ça !',
  '💪 Rien ne t\'arrête !',
  '🌟 Brillant !',
  '👏 Excellent !',
  '🏆 Tu maîtrises !',
];

const MODE_CONFIG: { [key in QuizMode]: { label: string; icon: string; color: string } } = {
  infini:    { label: 'Mode Infini',    icon: '♾️',  color: colors.primary },
  revision:  { label: 'Mode Révision',  icon: '🎯',  color: '#6366F1'      },
  examen:    { label: 'Mode Examen',    icon: '📝',  color: '#EF4444'      },
  entretien: { label: 'Mode Entretien', icon: '🎙️', color: '#F59E0B'      },
};

const CATEGORY_DOMAINS: { [key: string]: string[] } = {
  finance: ['ma', 'accounting', 'private-equity', 'structured-finance',
            'project-finance', 'capital-markets', 'ibd', 'asset-management'],
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

const Learn = () => {
  const navigate = useNavigate();
  const { category = 'finance', mode = 'infini' } = useParams<{ category: string; mode: string }>();
  const quizMode = mode as QuizMode;
  const modeConfig = MODE_CONFIG[quizMode] || MODE_CONFIG.infini;

  // Domaines
  const [domains, setDomains]                 = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [domainLevels, setDomainLevels]       = useState<DomainLevels>({});

  // Config session
  const [questionCount, setQuestionCount]     = useState(20);
  const [repetitions, setRepetitions]         = useState(0);
  const [timerEnabled, setTimerEnabled]       = useState(quizMode === 'examen' || quizMode === 'entretien');
  const [timerDuration, setTimerDuration]     = useState(30);
  const [timeLeft, setTimeLeft]               = useState(30);
  const timerRef                              = useRef<NodeJS.Timeout | null>(null);

  // Session
  const [sessionStarted, setSessionStarted]   = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [propositions, setPropositions]       = useState<{ text: string; correct: boolean }[]>([]);
  const [answerState, setAnswerState]         = useState<AnswerState>('unanswered');
  const [selectedIndex, setSelectedIndex]     = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentLevel, setCurrentLevel]       = useState(1);
  const [correctStreak, setCorrectStreak]     = useState(0);
  const [totalCorrect, setTotalCorrect]       = useState(0);
  const [totalAnswered, setTotalAnswered]     = useState(0);
  const [sessionXP, setSessionXP]             = useState(0);
  const [seenIds, setSeenIds]                 = useState<string[]>([]);
  const [missedIds, setMissedIds]             = useState<string[]>([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [noMoreQuestions, setNoMoreQuestions] = useState(false);

  // Mode Révision — file de questions
  const [revisionQueue, setRevisionQueue]     = useState<Question[]>([]);
  const [revisionDone, setRevisionDone]       = useState<string[]>([]);

  // Mode Examen — réponses stockées pour le corrigé final
  const [examAnswers, setExamAnswers]         = useState<{
    question: Question;
    selectedIndex: number;
    propositions: { text: string; correct: boolean }[];
    isCorrect: boolean;
  }[]>([]);
  const [showExamResults, setShowExamResults] = useState(false);

  // UI
  const [language]                            = useState('fr');
  const [encouragement, setEncouragement]     = useState<string | null>(null);
  const [showStreakBonus, setShowStreakBonus]  = useState<number | null>(null);

  // Couche sociale
  const [reactions, setReactions]             = useState<QuestionReactions | null>(null);
  const [comments, setComments]               = useState<Comment[]>([]);
  const [showComments, setShowComments]       = useState(false);
  const [newComment, setNewComment]           = useState('');
  const [replyTo, setReplyTo]                 = useState<{ id: string; author: string } | null>(null);
  const [questionStat, setQuestionStat]       = useState<{ successRate: number; totalAttempts: number } | null>(null);

  // ── Chargement domaines ───────────────────────────────────
  useEffect(() => {
    const slugs = CATEGORY_DOMAINS[category] || [];
    api.get('/domains').then(res => {
      const filtered = slugs.length > 0
        ? res.data.filter((d: Domain) => slugs.includes(d.slug))
        : res.data;
      setDomains(filtered);
    });
  }, [category]);

  // ── Chrono ────────────────────────────────────────────────
  useEffect(() => {
    if (!timerEnabled || !sessionStarted || answerState !== 'unanswered' || isLoading || !currentQuestion) return;
    setTimeLeft(timerDuration);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, timerEnabled, sessionStarted, isLoading]);

  useEffect(() => {
    if (answerState !== 'unanswered' && timerRef.current) clearInterval(timerRef.current);
  }, [answerState]);

  const handleTimeUp = () => {
    if (answerState !== 'unanswered' || !currentQuestion) return;
    const wrongIndex = propositions.findIndex(p => !p.correct);
    if (wrongIndex !== -1) handleAnswer(wrongIndex, true);
  };

  // ── Chargement social quand question change ───────────────
  useEffect(() => {
    if (!currentQuestion || !sessionStarted) return;
    // Réactions
    api.get(`/questions/${currentQuestion.id}/reactions`)
      .then(res => setReactions(res.data))
      .catch(() => {});
    // Stats globales
    api.get(`/questions/${currentQuestion.id}/stats`)
      .then(res => setQuestionStat(res.data))
      .catch(() => {});
    // Reset commentaires
    setComments([]);
    setShowComments(false);
    setNewComment('');
    setReplyTo(null);
  }, [currentQuestion?.id, sessionStarted]);

  // ── Helpers domaines/niveaux ──────────────────────────────
  const toggleDomain = (domainId: string) => {
    setSelectedDomains(prev => {
      if (prev.includes(domainId)) {
        const next = { ...domainLevels };
        delete next[domainId];
        setDomainLevels(next);
        return prev.filter(id => id !== domainId);
      }
      setDomainLevels(p => ({ ...p, [domainId]: [1] }));
      return [...prev, domainId];
    });
  };

  const toggleLevel = (domainId: string, level: number) => {
    setDomainLevels(prev => {
      const current = prev[domainId] || [];
      if (current.includes(level) && current.length === 1) return prev;
      return {
        ...prev,
        [domainId]: current.includes(level)
          ? current.filter(l => l !== level)
          : [...current, level],
      };
    });
  };

  const shufflePropositions = (props: { text: string; correct: boolean }[]) =>
    [...props].sort(() => Math.random() - 0.5);

  const getQuestionText = (q: Question) => language === 'fr' ? q.textFr : q.textEn;
  const getExplanation  = (q: Question) => language === 'fr' ? q.explanationFr : q.explanationEn;
  const getLevelInfo    = (level: number) => LEVEL_LABELS[level] || LEVEL_LABELS[1];

  const allLevels = selectedDomains.flatMap(id => domainLevels[id] || [1]);
  const startLevel = allLevels.length > 0 ? Math.min(...allLevels) : 1;
  const canStart = selectedDomains.length > 0 &&
    selectedDomains.every(id => (domainLevels[id] || []).length > 0);

  // Limite répétitions selon nombre de questions
  const maxRepetitions = Math.floor(questionCount / 2) - 1;

  // ── Démarrage session ─────────────────────────────────────
  const startSession = async () => {
    if (!canStart) return;
    setSessionStarted(true);
    setCorrectStreak(0);
    setTotalCorrect(0);
    setTotalAnswered(0);
    setSessionXP(0);
    setSeenIds([]);
    setMissedIds([]);
    setNoMoreQuestions(false);
    setExamAnswers([]);
    setShowExamResults(false);

    if (quizMode === 'infini') {
      setCurrentLevel(startLevel);
      await fetchInfiniQuestion(selectedDomains, startLevel, [], []);
    } else if (quizMode === 'revision' || quizMode === 'examen') {
      await buildSessionQueue();
    }
  };

  // ── Construit la file pour Révision et Examen ─────────────
  const buildSessionQueue = async () => {
    setIsLoading(true);
    try {
      const allLevelsList = Array.from(new Set(selectedDomains.flatMap(id => domainLevels[id] || [1])));
      const endpoint = quizMode === 'entretien' ? '/questions/interview' : '/questions/revision';
      const res = await api.get(endpoint, {
        params: {
            domainIds: selectedDomains.join(','),
            levels: allLevelsList.join(','),
            count: questionCount,
        },
        });

      let questions: Question[] = res.data;

      if (quizMode === 'revision' && repetitions > 0) {
        // Construit la file avec répétitions espacées (jamais consécutives)
        const uniqueCount = Math.floor(questionCount / (repetitions + 1));
        const base = questions.slice(0, uniqueCount);
        let queue: Question[] = [...base];

        for (let r = 0; r < repetitions; r++) {
          // Insère les répétitions de façon non-consécutive
          const shuffled = [...base].sort(() => Math.random() - 0.5);
          shuffled.forEach((q, i) => {
            // Position d'insertion : pas juste après la même question
            const minPos = queue.lastIndexOf(q) + 2;
            const insertPos = Math.min(
              Math.max(minPos, queue.length - uniqueCount + i),
              queue.length,
            );
            queue.splice(insertPos, 0, q);
          });
        }
        questions = queue;
      }

      setSessionQuestions(questions);
      setRevisionQueue(questions);
      setRevisionDone([]);

      if (questions.length === 0) {
        setNoMoreQuestions(true);
        return;
      }

      // Affiche la première question
      const first = questions[0];
      setCurrentQuestion(first);
      setCurrentIndex(0);
      const props = language === 'fr' ? first.propositionsFr : first.propositionsEn;
      setPropositions(shufflePropositions(props));
      setAnswerState('unanswered');
      setSelectedIndex(null);
      setShowExplanation(false);
    } catch {
      setNoMoreQuestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fetch question Mode Infini ────────────────────────────
  const fetchInfiniQuestion = useCallback(async (
    domainIds: string[],
    level: number,
    seen: string[],
    missed: string[],
  ) => {
    setIsLoading(true);
    setAnswerState('unanswered');
    setSelectedIndex(null);
    setShowExplanation(false);

    const eligibleDomains = domainIds.filter(id =>
      (domainLevels[id] || [1]).includes(level)
    );
    const queryDomains = eligibleDomains.length > 0 ? eligibleDomains : domainIds;

    try {
      const params = new URLSearchParams({
        domainIds: queryDomains.join(','),
        level: level.toString(),
        seenIds: seen.join(','),
        missedIds: missed.join(','),
      });
      const res = await api.get(`/questions/session?${params}`);
      if (!res.data) { setNoMoreQuestions(true); return; }
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

  // ── Gestion réponse ───────────────────────────────────────
  const handleAnswer = async (index: number, forcedByTimer = false) => {
    if (answerState !== 'unanswered' || !currentQuestion) return;

    const isCorrect = !forcedByTimer && propositions[index].correct;
    setSelectedIndex(index);

    if (quizMode === 'examen') {
      // En mode examen : pas de feedback, on stocke et on passe
      setExamAnswers(prev => [...prev, {
        question: currentQuestion,
        selectedIndex: index,
        propositions: [...propositions],
        isCorrect,
      }]);
      setAnswerState(isCorrect ? 'correct' : 'incorrect');
      // Auto-avance après 400ms
      setTimeout(() => handleNext(), 400);
      return;
    }

    setAnswerState(isCorrect ? 'correct' : 'incorrect');

    // Mode Infini : missed après 4 itérations (pas immédiatement)
    const newSeen = quizMode === 'infini' ? [...seenIds, currentQuestion.id] : seenIds;
    if (quizMode === 'infini') setSeenIds(newSeen);

    let newMissed = [...missedIds];
    let newStreak = correctStreak;
    let newLevel  = currentLevel;
    let xpGained  = 0;

    const allowedLevels = domainLevels[currentQuestion.domainId] || [1, 2, 3];
    const minLevel = Math.min(...allowedLevels);
    const maxLevel = Math.max(...allowedLevels);

    if (isCorrect) {
      newStreak = correctStreak + 1;
      xpGained  = XP_MAP[currentQuestion.level] || 5;

      // Bonus chrono
      if (timerEnabled && timeLeft > 0) {
        xpGained += TIMER_XP_BONUS[timerDuration] || 0;
      }

      // Streak bonus
      if (STREAK_BONUS[newStreak]) {
        xpGained += STREAK_BONUS[newStreak];
        setShowStreakBonus(STREAK_BONUS[newStreak]);
        setTimeout(() => setShowStreakBonus(null), 2000);
      }

      // Encouragement
      if (newStreak > 0 && newStreak % 3 === 0) {
        const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        setEncouragement(msg);
        setTimeout(() => setEncouragement(null), 2500);
      }

      // Level up (Mode Infini uniquement)
      if (quizMode === 'infini' && newStreak >= 5 && currentLevel < maxLevel) {
        newLevel = Math.min(currentLevel + 1, maxLevel);
      }

      // Mode Révision : marque comme réussi
      if (quizMode === 'revision') {
        setRevisionDone(prev => [...prev, currentQuestion.id]);
      }

      setTotalCorrect(prev => prev + 1);
    } else {
      newStreak = 0;
      newLevel  = quizMode === 'infini' ? Math.max(currentLevel - 1, minLevel) : currentLevel;

      // Mode Infini : revoir après 4 itérations
      if (quizMode === 'infini') {
        const currentSeenCount = newSeen.length;
        const revisitAt = currentSeenCount + 4;
        // On stocke l'ID à revoir dans missedIds avec un marqueur de position
        if (!newMissed.includes(currentQuestion.id)) {
          newMissed = [...newMissed, currentQuestion.id];
        }
        setMissedIds(newMissed);
      }

      // Mode Révision : remet la question en fin de file
      if (quizMode === 'revision') {
        setRevisionQueue(prev => {
          const rest = prev.slice(1);
          return [...rest, currentQuestion];
        });
      }

      setShowExplanation(false);
    }

    setCorrectStreak(newStreak);
    setCurrentLevel(newLevel);
    setSessionXP(prev => prev + xpGained);
    setTotalAnswered(prev => prev + 1);

    // Enregistre en base avec questionId
    try {
      await api.post('/user-progress/answer', {
        isCorrect,
        xp: xpGained,
        questionId: currentQuestion.id,
      });
    } catch {}
  };

  // ── Question suivante ─────────────────────────────────────
  const handleNext = () => {
    if (quizMode === 'infini') {
      // Vérifie si on doit revoir une question ratée (après 4 itérations)
      const nextSeen = seenIds;
      const shouldRevisit = missedIds.find(id => {
        const seenAfterMiss = nextSeen.indexOf(id);
        return seenAfterMiss !== -1 && (nextSeen.length - seenAfterMiss) >= 4;
      });

      if (shouldRevisit) {
        setMissedIds(prev => prev.filter(id => id !== shouldRevisit));
        // fetchInfiniQuestion avec cet ID spécifique
        api.get(`/questions/${shouldRevisit}/stats`).then(() => {
          fetchInfiniQuestion(
            selectedDomains, currentLevel,
            seenIds.filter(id => id !== shouldRevisit),
            missedIds,
          );
        });
      } else {
        fetchInfiniQuestion(selectedDomains, currentLevel, seenIds, missedIds);
      }
      return;
    }

    if (quizMode === 'revision') {
      // File de révision
      const nextQueue = answerState === 'correct'
        ? revisionQueue.slice(1)
        : revisionQueue; // déjà remis en fin dans handleAnswer

      // Session terminée si file vide ou toutes correctes
      if (nextQueue.length === 0) {
        setNoMoreQuestions(true);
        return;
      }

      const next = nextQueue[0];
      setRevisionQueue(nextQueue);
      setCurrentQuestion(next);
      setCurrentIndex(prev => prev + 1);
      const props = language === 'fr' ? next.propositionsFr : next.propositionsEn;
      setPropositions(shufflePropositions(props));
      setAnswerState('unanswered');
      setSelectedIndex(null);
      setShowExplanation(false);
      return;
    }

    if (quizMode === 'examen') {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= sessionQuestions.length) {
        setShowExamResults(true);
        return;
      }
      const next = sessionQuestions[nextIdx];
      setCurrentQuestion(next);
      setCurrentIndex(nextIdx);
      const props = language === 'fr' ? next.propositionsFr : next.propositionsEn;
      setPropositions(shufflePropositions(props));
      setAnswerState('unanswered');
      setSelectedIndex(null);
    }
  };

  // ── Chargement commentaires ───────────────────────────────
  const loadComments = async () => {
    if (!currentQuestion) return;
    try {
      const res = await api.get(`/questions/${currentQuestion.id}/comments`);
      setComments(res.data);
    } catch {}
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(p => !p);
  };

  const handleAddComment = async () => {
    if (!currentQuestion || !newComment.trim()) return;
    try {
      await api.post(`/questions/${currentQuestion.id}/comments`, {
        content: newComment,
        parentId: replyTo?.id,
      });
      setNewComment('');
      setReplyTo(null);
      loadComments();
    } catch {}
  };

const handleReaction = async (target: 'question' | 'explanation', type: 'like' | 'dislike') => {
  if (!currentQuestion) return;

  // Mise à jour optimiste immédiate
  setReactions(prev => {
    if (!prev) return prev;
    const currentType = prev.userReactions[target];
    const isRemoving  = currentType === type;
    const isChanging  = currentType !== null && currentType !== type;

    const newCounts = { ...prev.counts };

    if (target === 'question') {
      if (isRemoving) {
        newCounts.questionLikes    -= type === 'like'    ? 1 : 0;
        newCounts.questionDislikes -= type === 'dislike' ? 1 : 0;
      } else if (isChanging) {
        newCounts.questionLikes    += type === 'like'    ? 1 : -1;
        newCounts.questionDislikes += type === 'dislike' ? 1 : -1;
      } else {
        newCounts.questionLikes    += type === 'like'    ? 1 : 0;
        newCounts.questionDislikes += type === 'dislike' ? 1 : 0;
      }
    } else {
      if (isRemoving) {
        newCounts.explanationLikes    -= type === 'like'    ? 1 : 0;
        newCounts.explanationDislikes -= type === 'dislike' ? 1 : 0;
      } else if (isChanging) {
        newCounts.explanationLikes    += type === 'like'    ? 1 : -1;
        newCounts.explanationDislikes += type === 'dislike' ? 1 : -1;
      } else {
        newCounts.explanationLikes    += type === 'like'    ? 1 : 0;
        newCounts.explanationDislikes += type === 'dislike' ? 1 : 0;
      }
    }

    return {
      counts: newCounts,
      userReactions: {
        ...prev.userReactions,
        [target]: isRemoving ? null : type,
      },
    };
  });

  // Sync avec le serveur en arrière-plan
  try {
    await api.post(`/questions/${currentQuestion.id}/react`, { target, type });
  } catch {}
};

  const handleCommentReaction = async (commentId: string, type: 'like' | 'dislike') => {
    try {
      await api.post(`/questions/comments/${commentId}/react`, { type });
      loadComments();
    } catch {}
  };

  // ────────────────────────────────────────────────────────────────────────────
  // ── RENDU ────────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────────

  // ── RÉSULTATS EXAMEN ──────────────────────────────────────
  if (showExamResults) {
    const score = examAnswers.filter(a => a.isCorrect).length;
    const total = examAnswers.length;
    const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
    const xp    = examAnswers.reduce((sum, a) =>
      sum + (a.isCorrect ? (XP_MAP[a.question.level] || 5) : 0), 0);

    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
        <Navigation />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '88px 24px 64px' }}>

          {/* Score global */}
            <div style={{
            backgroundColor: colors.surface, borderRadius: radius.xl,
            padding: '40px', boxShadow: shadows.md, marginBottom: '24px',
            textAlign: 'center' as const,
            }}>
            {quizMode === 'entretien' ? (
                <>
                <p style={{ fontSize: '56px', margin: '0 0 8px 0' }}>
                    {pct >= 85 ? '🏆' : pct >= 70 ? '✅' : pct >= 55 ? '🟡' : '📚'}
                </p>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0' }}>
                    {score} / {total} bonnes réponses
                </h2>
                {/* Verdict entretien */}
                <div style={{
                    display: 'inline-block',
                    padding: '8px 24px', borderRadius: radius.full, marginBottom: '12px',
                    backgroundColor: pct >= 85 ? '#6366F115' : pct >= 70 ? '#22C55E15' : pct >= 55 ? '#F5A62315' : '#EF444415',
                    border: `2px solid ${pct >= 85 ? '#6366F1' : pct >= 70 ? '#22C55E' : pct >= 55 ? '#F5A623' : '#EF4444'}`,
                }}>
                    <p style={{
                    fontSize: '20px', fontWeight: '800', margin: 0,
                    color: pct >= 85 ? '#6366F1' : pct >= 70 ? '#22C55E' : pct >= 55 ? '#F5A623' : '#EF4444',
                    }}>
                    {pct >= 85 ? '⭐ Niveau Expert — Tu décroches le poste !' :
                    pct >= 70 ? '✅ Niveau Senior — Très bon entretien !' :
                    pct >= 55 ? '🟡 Niveau Junior — Peut mieux faire' :
                                '🔴 À retravailler — Continue à t\'entraîner'}
                    </p>
                </div>
                <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 8px 0' }}>
                    Score : <strong>{pct}%</strong> · +{xp} XP gagnés
                </p>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 24px 0' }}>
                    {pct >= 85 ? 'Excellente maîtrise des questions d\'entretien. Tu es prêt pour un process M&A.' :
                    pct >= 70 ? 'Bon niveau général. Quelques points à consolider avant un entretien senior.' :
                    pct >= 55 ? 'Bases correctes. Entraîne-toi encore sur les questions que tu as ratées.' :
                                'Revois les fondamentaux. Le mode Révision est ton meilleur ami.'}
                </p>
                </>
            ) : (
                <>
                <p style={{ fontSize: '56px', margin: '0 0 8px 0' }}>
                    {pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}
                </p>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0' }}>
                    {score} / {total} bonnes réponses
                </h2>
                <p style={{ fontSize: '32px', fontWeight: '800', color: modeConfig.color, margin: '0 0 16px 0' }}>
                    {pct}%
                </p>
                <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 24px 0' }}>
                    +{xp} XP gagnés
                </p>
                </>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                <button
                onClick={() => { setShowExamResults(false); setSessionStarted(false); setSelectedDomains([]); setDomainLevels({}); }}
                style={{ padding: '12px 24px', borderRadius: radius.md, border: `2px solid ${colors.border}`, backgroundColor: 'white', color: colors.primary, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: font.family }}
                >
                Recommencer
                </button>
                {quizMode === 'entretien' && pct < 70 && (
                <button
                    onClick={() => { setShowExamResults(false); setSessionStarted(false); navigate(`/learn/${category}/revision`); }}
                    style={{ padding: '12px 24px', borderRadius: radius.md, border: 'none', backgroundColor: '#6366F1', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}
                >
                    🎯 Réviser les points faibles
                </button>
                )}
                <button
                onClick={() => navigate('/dashboard')}
                style={{ padding: '12px 24px', borderRadius: radius.md, border: 'none', backgroundColor: colors.primary, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}
                >
                Tableau de bord
                </button>
            </div>
            </div>

          {/* Corrigé détaillé */}
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
            Corrigé détaillé
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
            {examAnswers.map((a, i) => (
              <div key={i} style={{
                backgroundColor: colors.surface, borderRadius: radius.lg,
                padding: '20px 24px', boxShadow: shadows.sm,
                borderLeft: `4px solid ${a.isCorrect ? '#22C55E' : '#EF4444'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{a.isCorrect ? '✅' : '❌'}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: colors.textMuted }}>
                    Question {i + 1}
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  {language === 'fr' ? a.question.textFr : a.question.textEn}
                </p>
                {a.propositions.map((p, pi) => {
                  const isSelected = pi === a.selectedIndex;
                  const bg = p.correct ? '#DCFCE7' : isSelected && !p.correct ? '#FEE2E2' : 'transparent';
                  const col = p.correct ? '#166534' : isSelected ? '#991B1B' : colors.textSecondary;
                  return (
                    <div key={pi} style={{
                      padding: '8px 12px', borderRadius: radius.sm,
                      backgroundColor: bg, color: col,
                      fontSize: '13px', marginBottom: '4px',
                      fontWeight: p.correct || isSelected ? '600' : '400',
                    }}>
                      {p.correct ? '✓ ' : isSelected ? '✗ ' : ''}{p.text}
                    </div>
                  );
                })}
                {/* Explication */}
                <div style={{
                  marginTop: '12px', padding: '12px',
                  backgroundColor: '#FFF7ED', borderRadius: radius.sm,
                  borderLeft: `3px solid #F5A623`,
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: colors.accent, margin: '0 0 4px 0' }}>
                    💡 Explication
                  </p>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                    {language === 'fr' ? a.question.explanationFr : a.question.explanationEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── FIN DE SESSION (Infini / Révision) ────────────────────
  if (noMoreQuestions) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
        <Navigation />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '88px 24px', textAlign: 'center' as const }}>
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '48px', boxShadow: shadows.md }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>
              {quizMode === 'revision' ? '🎓' : '🏆'}
            </p>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>
              {quizMode === 'revision' ? 'Toutes les questions maîtrisées !' : 'Session terminée !'}
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 32px 0' }}>
              {quizMode === 'revision'
                ? 'Tu as répondu correctement à toutes les questions de cette session.'
                : 'Tu as répondu à toutes les questions disponibles.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Questions',     value: totalAnswered,  icon: '❓' },
                { label: 'Correctes',     value: totalCorrect,   icon: '✅' },
                { label: 'Taux',          value: `${totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0}%`, icon: '🎯' },
                { label: 'XP gagnés',     value: `+${sessionXP}`, icon: '⭐' },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '16px' }}>
                  <p style={{ fontSize: '24px', margin: '0 0 4px 0' }}>{s.icon}</p>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: colors.primary, margin: '0 0 4px 0' }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{ flex: 1, padding: '14px', borderRadius: radius.md, border: `2px solid ${colors.border}`, backgroundColor: 'white', color: colors.primary, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: font.family }}
                onClick={() => { setSessionStarted(false); setSelectedDomains([]); setDomainLevels({}); }}
              >
                Recommencer
              </button>
              <button
                style={{ flex: 1, padding: '14px', borderRadius: radius.md, border: 'none', backgroundColor: colors.primary, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}
                onClick={() => navigate('/dashboard')}
              >
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCRAN DE CONFIGURATION ────────────────────────────────
  if (!sessionStarted) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
        <Navigation />
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '88px 24px 64px' }}>

          {/* Fil d'ariane */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            <button onClick={() => navigate('/learn')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: colors.textMuted, padding: 0, fontFamily: font.family }}>
              Disciplines
            </button>
            <span style={{ color: colors.textMuted }}>›</span>
            <button onClick={() => navigate(`/learn/${category}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: colors.textMuted, padding: 0, fontFamily: font.family }}>
              Finance
            </button>
            <span style={{ color: colors.textMuted }}>›</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: colors.primary }}>
              {modeConfig.icon} {modeConfig.label}
            </span>
          </div>

          {/* Titre */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>
              {modeConfig.icon} {modeConfig.label}
            </h1>
            <p style={{ fontSize: '15px', color: colors.textMuted, margin: 0 }}>
                {quizMode === 'infini'     && "Les questions s'adaptent à ton niveau. Tu peux t'arrêter quand tu veux."}
                {quizMode === 'revision'   && "L'algo sélectionne tes questions les plus difficiles. Répète jusqu'à maîtrise complète."}
                {quizMode === 'examen'     && "Aucun feedback pendant le quiz. Score et corrigé complet à la fin."}
                {quizMode === 'entretien'  && "Uniquement les questions typiques d'entretien. Chrono obligatoire. Verdict final : Junior, Senior ou Expert."}
            </p>
          </div>

          {/* 1. Domaines + niveaux */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '28px', boxShadow: shadows.sm, marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              1. Domaines et niveaux
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
              {domains.map(domain => {
                const isSelected = selectedDomains.includes(domain.id);
                const levels     = domainLevels[domain.id] || [];
                return (
                  <div key={domain.id} style={{
                    border: `2px solid ${isSelected ? domain.color : colors.border}`,
                    borderRadius: radius.lg,
                    backgroundColor: isSelected ? `${domain.color}08` : 'white',
                    overflow: 'hidden', transition: 'all 0.2s',
                  }}>
                    <button
                      style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' as const, fontFamily: font.family }}
                      onClick={() => toggleDomain(domain.id)}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{domain.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: colors.primary, flex: 1 }}>
                        {language === 'fr' ? domain.nameFr : domain.nameEn}
                      </span>
                      {isSelected && levels.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {levels.sort().map(l => (
                            <span key={l} style={{ fontSize: '10px', fontWeight: '700', color: LEVEL_LABELS[l].color, backgroundColor: `${LEVEL_LABELS[l].color}20`, padding: '2px 7px', borderRadius: radius.full }}>
                              {LEVEL_LABELS[l].short}
                            </span>
                          ))}
                        </div>
                      )}
                      <span style={{ fontSize: '16px', color: isSelected ? domain.color : colors.textMuted, flexShrink: 0 }}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </button>
                    {isSelected && (
                      <div style={{ borderTop: `1px solid ${domain.color}30`, padding: '8px 16px 12px 50px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: colors.textMuted, marginRight: '4px' }}>Niveaux :</span>
                        {([1, 2, 3] as const).map(lvl => {
                          const active = levels.includes(lvl);
                          return (
                            <button key={lvl} onClick={() => toggleLevel(domain.id, lvl)} style={{ padding: '4px 12px', borderRadius: radius.full, cursor: 'pointer', border: `2px solid ${LEVEL_LABELS[lvl].color}`, backgroundColor: active ? LEVEL_LABELS[lvl].color : 'white', color: active ? 'white' : LEVEL_LABELS[lvl].color, fontSize: '12px', fontWeight: '700', transition: 'all 0.15s', fontFamily: font.family }}>
                              {LEVEL_LABELS[lvl].label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Paramètres selon le mode */}
          {(quizMode === 'revision' || quizMode === 'examen') && (
            <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '24px 28px', boxShadow: shadows.sm, marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
                2. Nombre de questions
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                {[5, 10, 15, 20, 25, 30].map(n => (
                  <button key={n} onClick={() => { setQuestionCount(n); setRepetitions(Math.min(repetitions, Math.floor(n / 2) - 1)); }}
                    style={{ padding: '8px 18px', borderRadius: radius.full, cursor: 'pointer', border: `2px solid ${questionCount === n ? modeConfig.color : colors.border}`, backgroundColor: questionCount === n ? modeConfig.color : 'white', color: questionCount === n ? 'white' : colors.textSecondary, fontSize: '14px', fontWeight: '700', transition: 'all 0.15s', fontFamily: font.family }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Répétitions (Révision uniquement) */}
          {quizMode === 'revision' && (
            <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '24px 28px', boxShadow: shadows.sm, marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 4px 0' }}>
                3. Répétitions par question
              </h2>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 16px 0' }}>
                0 = chaque question vue 1 fois · 1 = vue 2 fois · 2 = vue 3 fois (max {maxRepetitions})
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                {Array.from({ length: maxRepetitions + 1 }, (_, i) => i).map(n => (
                  <button key={n} onClick={() => setRepetitions(n)}
                    style={{ padding: '8px 18px', borderRadius: radius.full, cursor: 'pointer', border: `2px solid ${repetitions === n ? '#6366F1' : colors.border}`, backgroundColor: repetitions === n ? '#6366F1' : 'white', color: repetitions === n ? 'white' : colors.textSecondary, fontSize: '14px', fontWeight: '700', transition: 'all 0.15s', fontFamily: font.family }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Chrono */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '24px 28px', boxShadow: shadows.sm, marginBottom: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              {quizMode === 'revision' ? '4.' : quizMode === 'examen' ? '2.' : '2.'} Chronomètre
              {quizMode === 'examen' && <span style={{ fontSize: '12px', color: '#EF4444', marginLeft: '8px' }}>obligatoire en mode examen</span>}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as const }}>
              {quizMode !== 'examen' && (
                <button onClick={() => setTimerEnabled(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: radius.full, cursor: 'pointer', border: `2px solid ${timerEnabled ? colors.primary : colors.border}`, backgroundColor: timerEnabled ? colors.primary : 'white', color: timerEnabled ? 'white' : colors.textSecondary, fontSize: '14px', fontWeight: '700', transition: 'all 0.2s', fontFamily: font.family }}>
                  <span>⏱️</span>
                  {timerEnabled ? 'Chrono activé' : 'Activer le chrono'}
                </button>
              )}
              {(timerEnabled || quizMode === 'examen' || quizMode === 'entretien') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '600' }}>Durée :</span>
                  {[15, 30, 45, 60].map(sec => (
                    <button key={sec} onClick={() => setTimerDuration(sec)} style={{ padding: '6px 14px', borderRadius: radius.full, cursor: 'pointer', border: `2px solid ${timerDuration === sec ? colors.primary : colors.border}`, backgroundColor: timerDuration === sec ? colors.primary : 'white', color: timerDuration === sec ? 'white' : colors.textSecondary, fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', fontFamily: font.family }}>
                      {sec}s
                    </button>
                  ))}
                </div>
              )}
            </div>
            {timerEnabled && (
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '10px 0 0 0' }}>
                ⚡ Bonus XP si tu réponds dans les temps · Temps écoulé = question incorrecte
              </p>
            )}
          </div>

          {/* Bouton lancer */}
          <button onClick={startSession} disabled={!canStart} style={{ width: '100%', padding: '16px', borderRadius: radius.lg, border: 'none', backgroundColor: canStart ? modeConfig.color : colors.border, color: 'white', fontSize: '16px', fontWeight: '700', cursor: canStart ? 'pointer' : 'not-allowed', transition: 'all 0.2s', fontFamily: font.family }}>
            ▶ Lancer la session
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────
  const levelInfo = getLevelInfo(currentLevel);
  const timerPercent = timerEnabled ? (timeLeft / timerDuration) * 100 : 100;
  const timerColor   = timerPercent > 50 ? '#22C55E' : timerPercent > 25 ? '#F5A623' : '#EF4444';

  // Progression pour Révision et Examen
  const progressTotal   = quizMode === 'infini' ? null : sessionQuestions.length;
  const progressCurrent = quizMode === 'infini' ? null : currentIndex + 1;

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: font.family }}>
      <Navigation />

      {/* TOASTS */}
      {showStreakBonus && (
        <div style={{ position: 'fixed' as const, top: '80px', right: '24px', backgroundColor: colors.accent, borderRadius: radius.lg, padding: '12px 18px', zIndex: 999, boxShadow: shadows.lg, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <p style={{ color: colors.primary, fontWeight: '800', fontSize: '15px', margin: 0 }}>Bonus streak +{showStreakBonus} XP !</p>
        </div>
      )}
      {encouragement && (
        <div style={{ position: 'fixed' as const, top: showStreakBonus ? '130px' : '80px', right: '24px', backgroundColor: colors.primary, borderRadius: radius.lg, padding: '10px 16px', zIndex: 998, boxShadow: shadows.lg }}>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>{encouragement}</p>
        </div>
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 24px 48px 24px' }}>

        {/* BARRE DE STATS */}
        <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '12px 20px', marginBottom: '14px', boxShadow: shadows.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '10px' }}>
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
            {/* Progression (Révision / Examen) */}
            {progressTotal && (
              <div style={{ textAlign: 'center' as const }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: modeConfig.color, margin: 0 }}>{progressCurrent}/{progressTotal}</p>
                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Progression</p>
              </div>
            )}
            {[
              { value: totalAnswered,    label: 'Répondues', color: colors.primary },
              { value: totalCorrect,     label: 'Correctes',  color: colors.success },
              { value: `+${sessionXP}`, label: 'XP',         color: colors.accent },
              ...(quizMode !== 'examen' ? [{ value: `${correctStreak} 🔥`, label: 'Série', color: '#EF4444' }] : []),
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' as const }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {quizMode === 'infini' && (
              <span style={{ fontSize: '11px', fontWeight: '700', color: levelInfo.color, backgroundColor: `${levelInfo.color}20`, padding: '3px 10px', borderRadius: radius.full }}>
                {levelInfo.label}
              </span>
            )}
            <span style={{ fontSize: '11px', fontWeight: '700', color: modeConfig.color, backgroundColor: `${modeConfig.color}15`, padding: '3px 10px', borderRadius: radius.full }}>
              {modeConfig.icon} {modeConfig.label}
            </span>
            <button onClick={() => { setSessionStarted(false); setSelectedDomains([]); setDomainLevels({}); }} style={{ fontSize: '11px', color: colors.textMuted, background: 'none', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '3px 10px', cursor: 'pointer', fontFamily: font.family }}>
              Arrêter
            </button>
          </div>
        </div>

        {/* BARRE DE PROGRESSION (Révision / Examen) */}
        {progressTotal && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ height: '5px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: modeConfig.color, width: `${((progressCurrent || 0) / progressTotal) * 100}%`, borderRadius: radius.full, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* BARRE CHRONO */}
        {(timerEnabled || quizMode === 'examen' || quizMode === 'entretien') && !isLoading && currentQuestion && answerState === 'unanswered' && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', color: colors.textMuted }}>⏱️ Temps restant</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: timerColor }}>{timeLeft}s</span>
            </div>
            <div style={{ height: '5px', backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: radius.full, backgroundColor: timerColor, width: `${timerPercent}%`, transition: 'width 1s linear, background-color 0.3s' }} />
            </div>
          </div>
        )}

        {/* QUESTION CARD */}
        {isLoading ? (
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '60px', textAlign: 'center' as const, boxShadow: shadows.sm }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>⏳</p>
            <p style={{ color: colors.textMuted }}>Chargement...</p>
          </div>
        ) : currentQuestion ? (
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: '28px', boxShadow: shadows.sm }}>

{/* En-tête question : stats globales + likes */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
  
  {/* Stats */}
  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const }}>
      <span style={{
        fontSize: '11px', fontWeight: '700',
        color: LEVEL_LABELS[currentQuestion.level]?.color || colors.textMuted,
        backgroundColor: `${LEVEL_LABELS[currentQuestion.level]?.color}20`,
        padding: '2px 8px', borderRadius: radius.full,
      }}>
        {LEVEL_LABELS[currentQuestion.level]?.label}
      </span>
      {questionStat && questionStat.totalAttempts > 0 && (
        <span style={{
          fontSize: '11px', color: colors.textMuted,
          backgroundColor: colors.background,
          padding: '2px 8px', borderRadius: radius.full,
        }}>
          🎯 {questionStat.successRate}% de réussite · {questionStat.totalAttempts} tentative{questionStat.totalAttempts > 1 ? 's' : ''}
        </span>
      )}
    </div>
  </div>

  {/* Likes question */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
    <button
      onClick={() => handleReaction('question', 'like')}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: `1px solid ${reactions?.userReactions.question === 'like' ? '#22C55E' : colors.border}`,
        borderRadius: radius.full, cursor: 'pointer',
        padding: '4px 10px',
        backgroundColor: reactions?.userReactions.question === 'like' ? '#DCFCE7' : 'white',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '14px' }}>👍</span>
      <span style={{
        fontSize: '12px', fontWeight: '700',
        color: reactions?.userReactions.question === 'like' ? '#166534' : colors.textMuted,
      }}>
        {reactions?.counts.questionLikes || 0}
      </span>
    </button>
    <button
      onClick={() => handleReaction('question', 'dislike')}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: `1px solid ${reactions?.userReactions.question === 'dislike' ? '#EF4444' : colors.border}`,
        borderRadius: radius.full, cursor: 'pointer',
        padding: '4px 10px',
        backgroundColor: reactions?.userReactions.question === 'dislike' ? '#FEE2E2' : 'white',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '14px' }}>👎</span>
      <span style={{
        fontSize: '12px', fontWeight: '700',
        color: reactions?.userReactions.question === 'dislike' ? '#991B1B' : colors.textMuted,
      }}>
        {reactions?.counts.questionDislikes || 0}
      </span>
    </button>
  </div>
</div>

            {/* Texte question */}
            <p style={{ fontSize: '17px', fontWeight: '700', color: colors.primary, margin: '0 0 24px 0', lineHeight: '1.55' }}>
              {getQuestionText(currentQuestion)}
            </p>

            {/* Propositions */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '20px' }}>
              {propositions.map((prop, index) => {
                let bgColor     = 'white';
                let borderColor = colors.border;
                let textColor   = colors.textPrimary;
                let icon        = null;

                // En mode examen : pas de feedback visuel
                if (answerState !== 'unanswered' && quizMode !== 'examen') {
                  if (prop.correct) {
                    bgColor = '#DCFCE7'; borderColor = '#22C55E'; textColor = '#166534'; icon = '✅';
                  } else if (index === selectedIndex && !prop.correct) {
                    bgColor = '#FEE2E2'; borderColor = '#EF4444'; textColor = '#991B1B'; icon = '❌';
                  }
                }

                return (
                  <button key={index}
                    style={{ padding: '12px 16px', borderRadius: radius.md, border: `2px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, fontSize: '14px', fontWeight: '500', cursor: answerState === 'unanswered' ? 'pointer' : 'default', textAlign: 'left' as const, transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: font.family }}
                    onClick={() => handleAnswer(index)}
                    disabled={answerState !== 'unanswered'}
                  >
                    <span>{prop.text}</span>
                    {icon && <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>}
                  </button>
                );
              })}
            </div>

            {/* FEEDBACK (pas en mode examen) */}
            {answerState !== 'unanswered' && quizMode !== 'examen' && (
              <>
                <div style={{ padding: '14px 18px', borderRadius: radius.md, marginBottom: '12px', backgroundColor: answerState === 'correct' ? '#DCFCE7' : '#FEE2E2', border: `1px solid ${answerState === 'correct' ? '#22C55E' : '#EF4444'}` }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: answerState === 'correct' ? '#166534' : '#991B1B' }}>
                    {answerState === 'correct'
                      ? `✅ Bonne réponse ! +${XP_MAP[currentQuestion.level]} XP${timerEnabled && timeLeft > 0 ? ` +${TIMER_XP_BONUS[timerDuration]} bonus ⏱️` : ''}`
                      : timeLeft === 0 && timerEnabled ? '⏰ Temps écoulé !' : '❌ Mauvaise réponse'}
                  </p>
                  <button onClick={() => setShowExplanation(p => !p)} style={{ fontSize: '12px', color: answerState === 'correct' ? '#166534' : '#991B1B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: font.family }}>
                    {showExplanation ? 'Masquer l\'explication' : 'Voir l\'explication ▼'}
                  </button>
                </div>

              {/* EXPLICATION */}
                {showExplanation && (
                  <div style={{ padding: '16px', borderRadius: radius.md, marginBottom: '12px', backgroundColor: '#FFF7ED', border: `1px solid #F5A623` }}>
                    
                    {/* Titre + like explication */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: colors.accent, margin: 0 }}>💡 Explication</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleReaction('explanation', 'like')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: `1px solid ${reactions?.userReactions.explanation === 'like' ? '#22C55E' : colors.border}`, borderRadius: radius.full, cursor: 'pointer', padding: '3px 8px', backgroundColor: reactions?.userReactions.explanation === 'like' ? '#DCFCE7' : 'white', transition: 'all 0.15s' }}
                        >
                          <span style={{ fontSize: '13px' }}>👍</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: reactions?.userReactions.explanation === 'like' ? '#166534' : colors.textMuted }}>
                            {reactions?.counts.explanationLikes || 0}
                          </span>
                        </button>
                        <button
                          onClick={() => handleReaction('explanation', 'dislike')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: `1px solid ${reactions?.userReactions.explanation === 'dislike' ? '#EF4444' : colors.border}`, borderRadius: radius.full, cursor: 'pointer', padding: '3px 8px', backgroundColor: reactions?.userReactions.explanation === 'dislike' ? '#FEE2E2' : 'white', transition: 'all 0.15s' }}
                        >
                          <span style={{ fontSize: '13px' }}>👎</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: reactions?.userReactions.explanation === 'dislike' ? '#991B1B' : colors.textMuted }}>
                            {reactions?.counts.explanationDislikes || 0}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Texte explication */}
                    <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 14px 0', lineHeight: '1.6' }}>
                      {getExplanation(currentQuestion)}
                    </p>

                    {/* Commentaires */}
                    <div style={{ borderTop: `1px solid #F5A62330`, paddingTop: '12px' }}>
                      <button onClick={handleToggleComments} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: colors.accent, fontWeight: '700', padding: 0, fontFamily: font.family }}>
                        {showComments ? '▲ Masquer les commentaires' : `▼ Commentaires${comments.length > 0 ? ` (${comments.length})` : ''}`}
                      </button>

                      {showComments && (
                        <div style={{ marginTop: '12px' }}>
                          {comments.length === 0 && (
                            <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 12px 0' }}>
                              Aucun commentaire. Sois le premier !
                            </p>
                          )}
                          {comments.map(comment => (
                            <CommentItem
                              key={comment.id}
                              comment={comment}
                              onReaction={handleCommentReaction}
                              onReply={(id, author) => setReplyTo({ id, author })}
                            />
                          ))}
                          {replyTo && (
                            <div style={{ fontSize: '12px', color: colors.accent, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>↩ Répondre à <strong>{replyTo.author}</strong></span>
                              <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, fontSize: '12px', fontFamily: font.family }}>✕</button>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                              placeholder={replyTo ? `Répondre à ${replyTo.author}...` : 'Ajouter un commentaire...'}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: radius.md, border: `1px solid ${colors.border}`, fontSize: '12px', fontFamily: font.family, outline: 'none' }}
                            />
                            <button onClick={handleAddComment} style={{ padding: '8px 14px', borderRadius: radius.md, border: 'none', backgroundColor: colors.accent, color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                              Envoyer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </>
            )}

            {/* BOUTON SUIVANT */}
            {answerState !== 'unanswered' && quizMode !== 'examen' && (
              <button onClick={handleNext} style={{ width: '100%', padding: '14px', borderRadius: radius.md, border: 'none', backgroundColor: modeConfig.color, color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: font.family }}>
                {quizMode === 'revision' && revisionQueue.length <= 1 ? 'Terminer la session ✓' : 'Question suivante →'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ── COMPOSANT COMMENTAIRE ─────────────────────────────────────────────────────
const CommentItem = ({
  comment,
  onReaction,
  onReply,
}: {
  comment: Comment;
  onReaction: (id: string, type: 'like' | 'dislike') => void;
  onReply: (id: string, author: string) => void;
}) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ backgroundColor: colors.background, borderRadius: radius.md, padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: colors.primary }}>
            {comment.author.firstName} {comment.author.lastName}
          </span>
          <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: '8px' }}>
            {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => onReaction(comment.id, 'like')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>👍</button>
          <span style={{ fontSize: '11px', color: colors.textMuted }}>{comment.likeCount}</span>
          <button onClick={() => onReaction(comment.id, 'dislike')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>👎</button>
          <button onClick={() => onReply(comment.id, `${comment.author.firstName}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: colors.accent, fontWeight: '600', marginLeft: '4px', fontFamily: font.family }}>
            Répondre
          </button>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0', lineHeight: '1.5' }}>
        {comment.content}
      </p>
    </div>
    {/* Réponses */}
    {comment.replies?.map(reply => (
      <div key={reply.id} style={{ marginLeft: '20px', marginTop: '6px', backgroundColor: `${colors.border}50`, borderRadius: radius.md, padding: '8px 12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: colors.primary }}>
          {reply.author.firstName} {reply.author.lastName}
        </span>
        <span style={{ fontSize: '10px', color: colors.textMuted, marginLeft: '6px' }}>
          {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
        </span>
        <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '3px 0 0 0', lineHeight: '1.5' }}>
          {reply.content}
        </p>
      </div>
    ))}
  </div>
);

export default Learn;