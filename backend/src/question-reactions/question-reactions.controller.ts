import {
  Controller, Post, Get, Delete,
  Param, Body, Req, UseGuards,
} from '@nestjs/common';
import { QuestionReactionsService } from './question-reactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionReactionsController {
  constructor(private readonly reactionsService: QuestionReactionsService) {}

  private getUserId(req: any): string {
    return req.user.sub || req.user.userId || req.user.id;
  }

  @Post(':id/react')
  async react(
    @Req() req: any,
    @Param('id') questionId: string,
    @Body() body: { target: 'question' | 'explanation'; type: 'like' | 'dislike' },
  ) {
    return this.reactionsService.toggleReaction(
      this.getUserId(req), questionId, body.target, body.type,
    );
  }

  @Get(':id/reactions')
  async getReactions(@Req() req: any, @Param('id') questionId: string) {
    const [userReactions, counts] = await Promise.all([
      this.reactionsService.getUserReactions(this.getUserId(req), questionId),
      this.reactionsService.getReactionCounts(questionId),
    ]);
    return { userReactions, counts };
  }

  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id') questionId: string) {
    return this.reactionsService.getComments(questionId, this.getUserId(req));
  }

  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id') questionId: string,
    @Body() body: { content: string; parentId?: string },
  ) {
    return this.reactionsService.addComment(
      this.getUserId(req), questionId, body.content, body.parentId,
    );
  }

  @Post('comments/:commentId/react')
  async reactToComment(
    @Req() req: any,
    @Param('commentId') commentId: string,
    @Body() body: { type: 'like' | 'dislike' },
  ) {
    await this.reactionsService.toggleCommentReaction(
      this.getUserId(req), commentId, body.type,
    );
    return { success: true };
  }

  @Delete('comments/:commentId')
  async deleteComment(@Req() req: any, @Param('commentId') commentId: string) {
    await this.reactionsService.deleteComment(this.getUserId(req), commentId);
    return { success: true };
  }
}