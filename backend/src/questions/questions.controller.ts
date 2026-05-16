import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSessionQuestion(
    @Query('domainIds') domainIds: string,
    @Query('level') level: string,
    @Query('seenIds') seenIds: string,
    @Query('missedIds') missedIds: string,
  ) {
    const domainIdArray = domainIds.split(',').filter(Boolean);
    const seenIdArray = seenIds ? seenIds.split(',').filter(Boolean) : [];
    const missedIdArray = missedIds ? missedIds.split(',').filter(Boolean) : [];
    return this.questionsService.findForSession(
      domainIdArray,
      parseInt(level) || 1,
      seenIdArray,
      missedIdArray,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('battle')
  async getBattleQuestions(
    @Query('domainIds') domainIds: string,
  ) {
    const domainIdArray = domainIds.split(',').filter(Boolean);
    const level1 = await this.questionsService.findRandom(domainIdArray, 1, 3);
    const level2 = await this.questionsService.findRandom(domainIdArray, 2, 2);
    const level3 = await this.questionsService.findRandom(domainIdArray, 3, 2);
    return [...level1, ...level2, ...level3].sort(() => Math.random() - 0.5);
  }

  @Post('seed/:domainId')
  async seed(@Param('domainId') domainId: string) {
    await this.questionsService.seed(domainId);
    return { message: 'Questions seeded successfully' };
  }
}