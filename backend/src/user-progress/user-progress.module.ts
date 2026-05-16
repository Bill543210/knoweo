import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './user-progress.entity';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProgress]),
    AuthModule,
  ],
  providers: [UserProgressService],
  controllers: [UserProgressController],
  exports: [UserProgressService],
})
export class UserProgressModule {}