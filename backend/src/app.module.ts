import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { SchoolsModule } from './schools/schools.module';
import { CompaniesModule } from './companies/companies.module';
import { DomainsModule } from './domains/domains.module';
import { QuestionsModule } from './questions/questions.module';
import { QuestionStatsModule } from './question-stats/question-stats.module';
import { UserQuestionHistoryModule } from './user-question-history/user-question-history.module';
import { QuestionReactionsModule } from './question-reactions/question-reactions.module';
import { QuestionCommentsModule } from './question-comments/question-comments.module';

import { User } from './users/user.entity';
import { UserProgress } from './user-progress/user-progress.entity';
import { School } from './schools/school.entity';
import { Company } from './companies/company.entity';
import { Domain } from './domains/domain.entity';
import { Question } from './questions/question.entity';
import { QuestionStat } from './question-stats/question-stat.entity';
import { UserQuestionHistory } from './user-question-history/user-question-history.entity';
import { QuestionReaction } from './question-reactions/question-reaction.entity';
import { QuestionComment } from './question-comments/question-comment.entity';
import { CommentReaction } from './question-comments/comment-reaction.entity';

import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Friendship } from './friends/friendship.entity';
import { Notification } from './notifications/notification.entity';

import { UserActivityModule } from './user-activity/user-activity.module';
import { UserActivity } from './user-activity/user-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '$Language1',
      database: 'knoweo',
      entities: [
        User,
        UserProgress,
        School,
        Company,
        Domain,
        Question,
        QuestionStat,
        UserQuestionHistory,
        QuestionReaction,
        QuestionComment,
        CommentReaction,
        Friendship,
        Notification,
        UserActivity,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    SearchModule,
    UserProgressModule,
    SchoolsModule,
    CompaniesModule,
    DomainsModule,
    QuestionsModule,
    QuestionStatsModule,
    UserQuestionHistoryModule,
    QuestionReactionsModule,
    QuestionCommentsModule,
    FriendsModule,
    NotificationsModule,
    UserActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}