import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuestionHistory } from './user-question-history.entity';
import { QuestionStat } from '../question-stats/question-stat.entity';

@Injectable()
export class UserQuestionHistoryService {
  constructor(
    @InjectRepository(UserQuestionHistory)
    private historyRepo: Repository<UserQuestionHistory>,
    @InjectRepository(QuestionStat)
    private statsRepo: Repository<QuestionStat>,
  ) {}

  // Appelé après chaque réponse
  async recordAnswer(
    userId: string,
    questionId: string,
    isCorrect: boolean,
  ): Promise<void> {
    // 1. Met à jour l'historique utilisateur
    let history = await this.historyRepo.findOne({
      where: { userId, questionId },
    });

    if (!history) {
      history = this.historyRepo.create({
        userId,
        questionId,
        attempts: 0,
        correctCount: 0,
        difficultyScore: 1,
      });
    }

    history.attempts += 1;
    if (isCorrect) history.correctCount += 1;
    history.lastSeenAt = new Date();
    history.lastAnswerCorrect = isCorrect;
    history.difficultyScore = 1 - (history.correctCount / history.attempts);

    await this.historyRepo.save(history);

    // 2. Met à jour les stats globales de la question
    let stat = await this.statsRepo.findOne({ where: { questionId } });

    if (!stat) {
      stat = this.statsRepo.create({
        questionId,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: 0,
      });
    }

    stat.totalAttempts += 1;
    if (isCorrect) stat.correctAttempts += 1;
    stat.successRate = stat.totalAttempts > 0
      ? Math.round((stat.correctAttempts / stat.totalAttempts) * 100)
      : 0;

    await this.statsRepo.save(stat);
  }

  // Retourne les questions les plus difficiles pour un user
  // Utilisé par le Mode Révision
  async getHardestQuestions(
    userId: string,
    domainIds: string[],
    levels: number[],
    limit: number,
  ): Promise<UserQuestionHistory[]> {
    const query = this.historyRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.question', 'question')
      .where('h.userId = :userId', { userId })
      .andWhere('question.domainId IN (:...domainIds)', { domainIds })
      .andWhere('question.isActive = true')
      .andWhere('h.attempts > 0')
      .orderBy('h.difficultyScore', 'DESC')
      .addOrderBy('h.attempts', 'DESC');

    if (levels.length > 0) {
      query.andWhere('question.level IN (:...levels)', { levels });
    }

    return query.limit(limit).getMany();
  }

  // Retourne le % de réussite global d'une question
  async getQuestionStat(questionId: string): Promise<{
    successRate: number;
    totalAttempts: number;
  }> {
    const stat = await this.statsRepo.findOne({ where: { questionId } });
    if (!stat) return { successRate: 0, totalAttempts: 0 };
    return {
      successRate: stat.successRate,
      totalAttempts: stat.totalAttempts,
    };
  }

async getDashboardData(userId: string): Promise<{
  domainStats: {
    domainId: string;
    category: string;
    attempts: number;
    correctCount: number;
    masteredCount: number;
    successRate: number;
  }[];
  strongQuestions: {
    questionId: string;
    domainId: string;
    successRate: number;
    textFr: string;
    textEn: string;
    isInterviewQuestion: boolean;
  }[];
  weakQuestions: {
    questionId: string;
    domainId: string;
    successRate: number;
    textFr: string;
    textEn: string;
    isInterviewQuestion: boolean;
  }[];
  todayCount: number;
  interviewReadiness: {
    domainId: string;
    category: string;
    totalInterviewQuestions: number;
    correctInterviewQuestions: number;
    readinessScore: number;
  }[];
}> {
  const histories = await this.historyRepo
    .createQueryBuilder('h')
    .leftJoinAndSelect('h.question', 'question')
    .leftJoinAndSelect('question.domain', 'domain')
    .where('h.userId = :userId', { userId })
    .andWhere('h.attempts > 0')
    .getMany();

  // Stats par domaine
  const byDomain: {
    [domainId: string]: {
      attempts: number;
      correct: number;
      mastered: number;
      category: string;
      interviewAttempts: number;
      interviewCorrect: number;
    };
  } = {};

  for (const h of histories) {
    const q   = h.question;
    const did = q?.domainId;
    if (!did) continue;

    if (!byDomain[did]) {
      byDomain[did] = {
        attempts: 0, correct: 0, mastered: 0,
        category: (q.domain as any)?.category || 'finance',
        interviewAttempts: 0, interviewCorrect: 0,
      };
    }

    byDomain[did].attempts += h.attempts;
    byDomain[did].correct  += h.correctCount;
    if (h.difficultyScore <= 0.3) byDomain[did].mastered += 1;

    if (q.isInterviewQuestion) {
      byDomain[did].interviewAttempts += h.attempts;
      byDomain[did].interviewCorrect  += h.correctCount;
    }
  }

  const domainStats = Object.entries(byDomain).map(([domainId, d]) => ({
    domainId,
    category:      d.category,
    attempts:      d.attempts,
    correctCount:  d.correct,
    masteredCount: d.mastered,
    successRate:   d.attempts > 0
      ? Math.round((d.correct / d.attempts) * 100)
      : 0,
  }));

  // Préparation du texte court (nettoie le préfixe "❓ Question d'entretien X —")
  const cleanText = (text: string) =>
    text
      .replace(/^[❓\s]*question\s+d['']entretien\s+[^—–\-]*[—–\-]\s*/i, '')
      .trim()
      .slice(0, 90) + (text.length > 90 ? '...' : '');

  // Questions fortes
  const strong = histories
    .filter(h => h.attempts >= 2 && h.difficultyScore <= 0.2 && h.question)
    .sort((a, b) => a.difficultyScore - b.difficultyScore)
    .slice(0, 5)
    .map(h => ({
      questionId:          h.questionId,
      domainId:            h.question.domainId,
      successRate:         Math.round((1 - h.difficultyScore) * 100),
      textFr:              cleanText(h.question.textFr),
      textEn:              cleanText(h.question.textEn),
      isInterviewQuestion: h.question.isInterviewQuestion,
    }));

  // Questions faibles
  const weak = histories
    .filter(h => h.attempts >= 2 && h.difficultyScore >= 0.6 && h.question)
    .sort((a, b) => b.difficultyScore - a.difficultyScore)
    .slice(0, 5)
    .map(h => ({
      questionId:          h.questionId,
      domainId:            h.question.domainId,
      successRate:         Math.round((1 - h.difficultyScore) * 100),
      textFr:              cleanText(h.question.textFr),
      textEn:              cleanText(h.question.textEn),
      isInterviewQuestion: h.question.isInterviewQuestion,
    }));

  // Score de préparation entretien par domaine
  const interviewReadiness = Object.entries(byDomain)
    .filter(([, d]) => d.interviewAttempts > 0)
    .map(([domainId, d]) => ({
      domainId,
      category:                d.category,
      totalInterviewQuestions: d.interviewAttempts,
      correctInterviewQuestions: d.interviewCorrect,
      readinessScore: Math.round((d.interviewCorrect / d.interviewAttempts) * 100),
    }));

  // Questions répondues aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = histories.filter(h =>
    h.lastSeenAt && new Date(h.lastSeenAt) >= today
  ).length;

  return {
    domainStats,
    strongQuestions: strong,
    weakQuestions:   weak,
    todayCount,
    interviewReadiness,
  };
}
}