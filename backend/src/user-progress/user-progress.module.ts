import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './user-progress.entity';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { AuthModule } from '../auth/auth.module';
import { UserQuestionHistoryModule } from '../user-question-history/user-question-history.module';
import { FriendsModule } from '../friends/friends.module';
import { UserActivityModule } from '../user-activity/user-activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProgress]),
    AuthModule,
    UserQuestionHistoryModule,
    FriendsModule,
    UserActivityModule,
  ],
  providers: [UserProgressService],
  controllers: [UserProgressController],
  exports: [UserProgressService],
})
export class UserProgressModule {}