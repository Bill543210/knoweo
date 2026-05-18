import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionStat } from './question-stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionStat])],
  exports: [TypeOrmModule],
})
export class QuestionStatsModule {}