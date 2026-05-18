import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './user-progress.entity';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
  ) {}

  async getOrCreateProgress(userId: string): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({ where: { userId } });
    if (!progress) {
      progress = this.progressRepository.create({ userId });
      await this.progressRepository.save(progress);
    }
    return progress;
  }

  async getStats(userId: string) {
    const progress     = await this.getOrCreateProgress(userId);
    const correctRate  = progress.questionsAnswered > 0
      ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)
      : 0;
    const hours   = Math.floor(progress.totalTimeMinutes / 60);
    const minutes = progress.totalTimeMinutes % 60;
    const totalTime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

    return {
      totalXP:           progress.totalXP,
      currentStreak:     progress.currentStreak,
      maxStreak:         progress.maxStreak,
      questionsAnswered: progress.questionsAnswered,
      correctAnswers:    progress.correctAnswers,
      correctRate,
      battlesPlayed:     progress.battlesPlayed,
      battlesWon:        progress.battlesWon,
      totalTime,
      totalTimeMinutes:  progress.totalTimeMinutes,
      lastActivityDate:  progress.lastActivityDate,
      updatedAt:         progress.updatedAt,
    };
  }

  async addXP(userId: string, xp: number): Promise<UserProgress> {
    const progress    = await this.getOrCreateProgress(userId);
    progress.totalXP += xp;
    return this.progressRepository.save(progress);
  }

  async updateStreak(userId: string): Promise<UserProgress> {
    const progress    = await this.getOrCreateProgress(userId);
    const today       = new Date();
    const lastActivity = progress.lastActivityDate
      ? new Date(progress.lastActivityDate)
      : null;

    if (lastActivity) {
      const diffDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1)      progress.currentStreak += 1;
      else if (diffDays > 1)   progress.currentStreak = 1;
    } else {
      progress.currentStreak = 1;
    }

    if (progress.currentStreak > progress.maxStreak) {
      progress.maxStreak = progress.currentStreak;
    }

    progress.lastActivityDate = today;
    return this.progressRepository.save(progress);
  }

  async recordAnswer(userId: string, isCorrect: boolean): Promise<UserProgress> {
    const progress = await this.getOrCreateProgress(userId);
    progress.questionsAnswered += 1;
    if (isCorrect) progress.correctAnswers += 1;
    return this.progressRepository.save(progress);
  }

  // ── LEADERBOARD ───────────────────────────────────────────

  async getGlobalLeaderboard(currentUserId: string, limit = 100): Promise<any[]> {
    const rows = await this.progressRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .where('p.questionsAnswered > 0')
      .orderBy('p.totalXP', 'DESC')
      .addOrderBy('p.questionsAnswered', 'DESC')
      .limit(limit)
      .getMany();

    return this.formatLeaderboard(rows, currentUserId);
  }

  async getFriendsLeaderboard(
    currentUserId: string,
    friendIds: string[],
  ): Promise<any[]> {
    if (friendIds.length === 0) return [];

    const allIds = [currentUserId, ...friendIds];
    const rows   = await this.progressRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .where('p.userId IN (:...allIds)', { allIds })
      .orderBy('p.totalXP', 'DESC')
      .addOrderBy('p.questionsAnswered', 'DESC')
      .getMany();

    return this.formatLeaderboard(rows, currentUserId);
  }

  async getUserDailyGoal(userId: string): Promise<number> {
  const result = await this.progressRepository.manager
    .getRepository('User')
    .findOne({ where: { id: userId }, select: ['dailyGoal'] });
  return (result as any)?.dailyGoal || 10;
}

  async getDomainLeaderboard(
    currentUserId: string,
    domainId: string,
    limit = 100,
  ): Promise<any[]> {
    // Classement par taux de réussite sur un domaine spécifique
    // Jointure avec user_question_history via raw query
    const rows = await this.progressRepository.manager
      .createQueryBuilder()
      .select([
        'u.id                                          AS "userId"',
        'u."firstName"                                AS "firstName"',
        'u."lastName"                                 AS "lastName"',
        'u."avatarUrl"                                AS "avatarUrl"',
        'u.status                                     AS "status"',
        'u."jobTitle"                                 AS "jobTitle"',
        'u.company                                    AS "company"',
        'p."totalXP"                                  AS "totalXP"',
        'p."currentStreak"                            AS "currentStreak"',
        'SUM(h.attempts)                              AS "attempts"',
        'SUM(h."correctCount")                        AS "correctCount"',
        'CASE WHEN SUM(h.attempts) > 0 THEN ROUND((SUM(h."correctCount")::float / SUM(h.attempts)) * 100) ELSE 0 END AS "successRate"',
      ])
      .from('user', 'u')
      .innerJoin('user_progress', 'p', 'p."userId" = u.id')
      .innerJoin('user_question_history', 'h', 'h."userId" = u.id')
      .innerJoin('question', 'q', 'q.id = h."questionId"')
      .where('q."domainId" = :domainId', { domainId })
      .andWhere('h.attempts > 0')
      .groupBy('u.id, u."firstName", u."lastName", u."avatarUrl", u.status, u."jobTitle", u.company, p."totalXP", p."currentStreak"')
      .having('SUM(h.attempts) >= 5')
      .orderBy('"successRate"', 'DESC')
      .addOrderBy('SUM(h.attempts)', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((row, index) => ({
      rank:          index + 1,
      userId:        row.userId,
      firstName:     row.firstName,
      lastName:      row.lastName,
      avatarUrl:     row.avatarUrl,
      status:        row.status,
      jobTitle:      row.jobTitle,
      company:       row.company,
      totalXP:       parseInt(row.totalXP) || 0,
      currentStreak: parseInt(row.currentStreak) || 0,
      attempts:      parseInt(row.attempts) || 0,
      correctCount:  parseInt(row.correctCount) || 0,
      successRate:   parseInt(row.successRate) || 0,
      isCurrentUser: row.userId === currentUserId,
    }));
  }

  private formatLeaderboard(rows: any[], currentUserId: string) {
    return rows.map((p, index) => {
      const correctRate = p.questionsAnswered > 0
        ? Math.round((p.correctAnswers / p.questionsAnswered) * 100)
        : 0;
      return {
        rank:              index + 1,
        userId:            p.userId,
        firstName:         p.user?.firstName || '',
        lastName:          p.user?.lastName  || '',
        avatarUrl:         p.user?.avatarUrl || null,
        status:            p.user?.status    || null,
        jobTitle:          p.user?.jobTitle  || null,
        company:           p.user?.company   || null,
        totalXP:           p.totalXP,
        currentStreak:     p.currentStreak,
        questionsAnswered: p.questionsAnswered,
        correctRate,
        isCurrentUser:     p.userId === currentUserId,
      };
    });
  }
}