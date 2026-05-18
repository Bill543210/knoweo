import {
  Controller, Get, Post, Body,
  Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserQuestionHistoryService } from '../user-question-history/user-question-history.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private questionsService: QuestionsService,
    private userQuestionHistoryService: UserQuestionHistoryService,
  ) {}

  // ── MODE INFINI (existant) ────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSessionQuestion(
    @Query('domainIds') domainIds: string,
    @Query('level') level: string,
    @Query('seenIds') seenIds: string,
    @Query('missedIds') missedIds: string,
  ) {
    const domainIdArray  = domainIds.split(',').filter(Boolean);
    const seenIdArray    = seenIds   ? seenIds.split(',').filter(Boolean)   : [];
    const missedIdArray  = missedIds ? missedIds.split(',').filter(Boolean) : [];
    return this.questionsService.findForSession(
      domainIdArray,
      parseInt(level) || 1,
      seenIdArray,
      missedIdArray,
    );
  }

  // ── MODE RÉVISION ─────────────────────────────────────────
  // Retourne les questions les plus difficiles pour cet user
  // + complète avec des questions aléatoires si pas assez d'historique
  @UseGuards(JwtAuthGuard)
  @Get('revision')
  async getRevisionQuestions(
    @Request() req: any,
    @Query('domainIds') domainIds: string,
    @Query('levels') levels: string,
    @Query('count') count: string,
  ) {
    const userId       = req.user.sub;
    const domainIdArray = domainIds.split(',').filter(Boolean);
    const levelArray    = levels ? levels.split(',').map(Number).filter(Boolean) : [1, 2, 3];
    const total         = Math.min(parseInt(count) || 10, 30);

    // 1. Récupère les questions difficiles de l'historique user
    const hardHistory = await this.userQuestionHistoryService.getHardestQuestions(
      userId,
      domainIdArray,
      levelArray,
      total,
    );

    const hardQuestionIds = hardHistory.map(h => h.questionId);
    const hardQuestions   = hardHistory
      .filter(h => h.question)
      .map(h => h.question);

    // 2. Si pas assez → complète avec des questions aléatoires
    const needed = total - hardQuestions.length;
    let fillerQuestions: any[] = [];

    if (needed > 0) {
      const excludeIds = [...hardQuestionIds];
      for (const level of levelArray) {
        if (fillerQuestions.length >= needed) break;
        const random = await this.questionsService.findRandom(
          domainIdArray,
          level,
          needed,
          excludeIds,
        );
        fillerQuestions = [...fillerQuestions, ...random];
        excludeIds.push(...random.map((q: any) => q.id));
      }
      fillerQuestions = fillerQuestions.slice(0, needed);
    }

    // 3. Mélange : difficiles en priorité, fillers en complément
    const allQuestions = [...hardQuestions, ...fillerQuestions]
      .sort(() => Math.random() - 0.5);

    return allQuestions.slice(0, total);
  }

  // ── STATS D'UNE QUESTION ──────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(':id/stats')
  async getQuestionStats(@Param('id') questionId: string) {
    return this.userQuestionHistoryService.getQuestionStat(questionId);
  }

// ── MODE ENTRETIEN ────────────────────────────────────────
@UseGuards(JwtAuthGuard)
@Get('interview')
async getInterviewQuestions(
  @Query('domainIds') domainIds: string,
  @Query('levels') levels: string,
  @Query('count') count: string,
) {
  const domainIdArray = domainIds.split(',').filter(Boolean);
  const levelArray    = levels
    ? levels.split(',').map(Number).filter(Boolean)
    : [1, 2, 3];
  const total = Math.min(parseInt(count) || 20, 30);

  return this.questionsService.findForInterview(
    domainIdArray,
    levelArray,
    total,
  );
}

  // ── BATTLE (existant) ─────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('battle')
  async getBattleQuestions(@Query('domainIds') domainIds: string) {
    const domainIdArray = domainIds.split(',').filter(Boolean);
    const level1 = await this.questionsService.findRandom(domainIdArray, 1, 3);
    const level2 = await this.questionsService.findRandom(domainIdArray, 2, 2);
    const level3 = await this.questionsService.findRandom(domainIdArray, 3, 2);
    return [...level1, ...level2, ...level3].sort(() => Math.random() - 0.5);
  }

@UseGuards(JwtAuthGuard)
@Get('dashboard')
async getDashboard(@Request() req: any) {
  return this.userQuestionHistoryService.getDashboardData(req.user.sub);
}

  // ── SEED (existant) ───────────────────────────────────────
  @Post('seed/:domainId')
  async seed(@Param('domainId') domainId: string) {
    await this.questionsService.seed(domainId);
    return { message: 'Questions seeded successfully' };
  }
}