import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionReaction } from './question-reaction.entity';
import { QuestionComment } from '../question-comments/question-comment.entity';
import { CommentReaction } from '../question-comments/comment-reaction.entity';
import { User } from '../users/user.entity';
import { QuestionReactionsService } from './question-reactions.service';
import { QuestionReactionsController } from './question-reactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    QuestionReaction,
    QuestionComment,
    CommentReaction,
    User,
  ])],
  providers: [QuestionReactionsService],
  controllers: [QuestionReactionsController],
  exports: [QuestionReactionsService],
})
export class QuestionReactionsModule {}