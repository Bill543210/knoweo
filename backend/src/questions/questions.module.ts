import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { UserQuestionHistoryModule } from '../user-question-history/user-question-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    UserQuestionHistoryModule,
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}