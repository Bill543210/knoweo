import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-progress')
export class UserProgressController {
  constructor(private userProgressService: UserProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: any) {
    return this.userProgressService.getStats(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answer')
  async recordAnswer(
    @Request() req: any,
    @Body() body: { isCorrect: boolean; xp: number },
  ) {
    await this.userProgressService.recordAnswer(req.user.sub, body.isCorrect);
    if (body.xp > 0) await this.userProgressService.addXP(req.user.sub, body.xp);
    await this.userProgressService.updateStreak(req.user.sub);
    return { success: true };
  }
}