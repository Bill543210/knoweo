import {
  Controller, Get, Post, Body,
  Query, UseGuards, Request,
} from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserQuestionHistoryService } from '../user-question-history/user-question-history.service';
import { FriendsService } from '../friends/friends.service';
import { UserActivityService } from '../user-activity/user-activity.service';

@Controller('user-progress')
export class UserProgressController {
  constructor(
    private userProgressService: UserProgressService,
    private userQuestionHistoryService: UserQuestionHistoryService,
    private friendsService: FriendsService,
    private userActivityService: UserActivityService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: any) {
    return this.userProgressService.getStats(req.user.sub);
  }

@UseGuards(JwtAuthGuard)
@Post('answer')
async recordAnswer(
  @Request() req: any,
  @Body() body: { isCorrect: boolean; xp: number; questionId?: string },
) {
  const userId = req.user.sub;

  await this.userProgressService.recordAnswer(userId, body.isCorrect);
  if (body.xp > 0) await this.userProgressService.addXP(userId, body.xp);
  await this.userProgressService.updateStreak(userId);

  if (body.questionId) {
    await this.userQuestionHistoryService.recordAnswer(
      userId, body.questionId, body.isCorrect,
    );
  }

  // Alimente le log d'activité quotidienne
  await this.userActivityService.recordAnswer(userId, body.isCorrect, body.xp || 0);

  return { success: true };
}

@UseGuards(JwtAuthGuard)
@Get('activity')
async getActivity(
  @Request() req: any,
  @Query('days') days?: string,
) {
  const d = Math.min(parseInt(days || '30'), 90);
  return this.userActivityService.getActivity(req.user.sub, d);
}

@UseGuards(JwtAuthGuard)
@Get('today')
async getToday(@Request() req: any) {
  const userId = req.user.sub;
  const [today, user] = await Promise.all([
    this.userActivityService.getTodayActivity(userId),
    this.userProgressService.getUserDailyGoal(userId),
  ]);
  return { ...today, dailyGoal: user };
}

  // ── LEADERBOARD ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  async getLeaderboard(
    @Request() req: any,
    @Query('type') type: string = 'global',
    @Query('domainId') domainId?: string,
    @Query('limit') limit?: string,
  ) {
    const userId  = req.user.sub;
    const maxRows = Math.min(parseInt(limit || '100'), 100);

    if (type === 'friends') {
      const friends   = await this.friendsService.getFriends(userId);
      const friendIds = friends.map((f: any) => f.id);
      return this.userProgressService.getFriendsLeaderboard(userId, friendIds);
    }

    if (type === 'domain' && domainId) {
      return this.userProgressService.getDomainLeaderboard(userId, domainId, maxRows);
    }

    return this.userProgressService.getGlobalLeaderboard(userId, maxRows);
  }
}