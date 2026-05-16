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
    let progress = await this.progressRepository.findOne({
      where: { userId },
    });
    if (!progress) {
      progress = this.progressRepository.create({ userId });
      await this.progressRepository.save(progress);
    }
    return progress;
  }

  async getStats(userId: string) {
    const progress = await this.getOrCreateProgress(userId);
    const correctRate = progress.questionsAnswered > 0
      ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)
      : 0;
    const hours = Math.floor(progress.totalTimeMinutes / 60);
    const minutes = progress.totalTimeMinutes % 60;
    const totalTime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

    return {
      totalXP: progress.totalXP,
      currentStreak: progress.currentStreak,
      maxStreak: progress.maxStreak,
      questionsAnswered: progress.questionsAnswered,
      correctAnswers: progress.correctAnswers,
      correctRate,
      battlesPlayed: progress.battlesPlayed,
      battlesWon: progress.battlesWon,
      totalTime,
      totalTimeMinutes: progress.totalTimeMinutes,
      lastActivityDate: progress.lastActivityDate,
      updatedAt: progress.updatedAt,
    };
  }

  async addXP(userId: string, xp: number): Promise<UserProgress> {
    const progress = await this.getOrCreateProgress(userId);
    progress.totalXP += xp;
    return this.progressRepository.save(progress);
  }

  async updateStreak(userId: string): Promise<UserProgress> {
    const progress = await this.getOrCreateProgress(userId);
    const today = new Date();
    const lastActivity = progress.lastActivityDate
      ? new Date(progress.lastActivityDate)
      : null;

    if (lastActivity) {
      const diffDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1) {
        progress.currentStreak += 1;
      } else if (diffDays > 1) {
        progress.currentStreak = 1;
      }
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
}