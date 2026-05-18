import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from './user-activity.entity';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private activityRepo: Repository<UserActivity>,
  ) {}

  // Appelé après chaque réponse
  async recordAnswer(
    userId: string,
    isCorrect: boolean,
    xpEarned: number,
  ): Promise<void> {
    const now   = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let activity = await this.activityRepo.findOne({
      where: { userId, date: today },
    });

    if (!activity) {
      activity = this.activityRepo.create({
        userId,
        date: today,
        questionsAnswered: 0,
        correctAnswers: 0,
        xpEarned: 0,
      });
    }

    activity.questionsAnswered += 1;
    if (isCorrect) activity.correctAnswers += 1;
    activity.xpEarned += xpEarned;

    await this.activityRepo.save(activity);
  }

  // Retourne l'activité des N derniers jours
  async getActivity(
    userId: string,
    days: number = 30,
  ): Promise<{
    date: string;
    questionsAnswered: number;
    correctAnswers: number;
    xpEarned: number;
    successRate: number;
  }[]> {
    // Génère toutes les dates de la période
    const result: any[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      result.push({
        date:              d.toISOString().split('T')[0],
        questionsAnswered: 0,
        correctAnswers:    0,
        xpEarned:          0,
        successRate:       0,
      });
    }

    // Remplit avec les vraies données
    const startDate = result[0].date;
    const activities = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .andWhere('a.date >= :startDate', { startDate })
      .orderBy('a.date', 'ASC')
      .getMany();

    for (const act of activities) {
      const entry = result.find(r => r.date === act.date);
      if (entry) {
        entry.questionsAnswered = act.questionsAnswered;
        entry.correctAnswers    = act.correctAnswers;
        entry.xpEarned          = act.xpEarned;
        entry.successRate        = act.questionsAnswered > 0
          ? Math.round((act.correctAnswers / act.questionsAnswered) * 100)
          : 0;
      }
    }

    return result;
  }

  // Activité du jour — pour le widget objectif
  async getTodayActivity(userId: string): Promise<{
    questionsAnswered: number;
    correctAnswers: number;
    xpEarned: number;
  }> {
    const today    = new Date().toISOString().split('T')[0];
    const activity = await this.activityRepo.findOne({
      where: { userId, date: today },
    });

    return {
      questionsAnswered: activity?.questionsAnswered || 0,
      correctAnswers:    activity?.correctAnswers    || 0,
      xpEarned:          activity?.xpEarned          || 0,
    };
  }
}