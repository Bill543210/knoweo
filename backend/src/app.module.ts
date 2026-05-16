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
import { User } from './users/user.entity';
import { UserProgress } from './user-progress/user-progress.entity';
import { School } from './schools/school.entity';
import { Company } from './companies/company.entity';
import { Domain } from './domains/domain.entity';
import { Question } from './questions/question.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '$Language1',
      database: 'knoweo',
      entities: [User, UserProgress, School, Company, Domain, Question],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}