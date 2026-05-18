import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestionHistory } from './user-question-history.entity';
import { UserQuestionHistoryService } from './user-question-history.service';
import { QuestionStat } from '../question-stats/question-stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuestionHistory, QuestionStat])],
  providers: [UserQuestionHistoryService],
  exports: [UserQuestionHistoryService],
})
export class UserQuestionHistoryModule {}