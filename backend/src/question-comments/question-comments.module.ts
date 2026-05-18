import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionComment } from './question-comment.entity';
import { CommentReaction } from './comment-reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionComment, CommentReaction])],
  exports: [TypeOrmModule],
})
export class QuestionCommentsModule {}