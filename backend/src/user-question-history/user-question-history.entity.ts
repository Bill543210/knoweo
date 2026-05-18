import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Question } from '../questions/question.entity';

@Entity()
@Unique(['userId', 'questionId'])
export class UserQuestionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  questionId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  question: Question;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 0 })
  correctCount: number;

  // 0 = maîtrisé, 1 = très difficile
  // Calculé : 1 - (correctCount / attempts)
  @Column({ type: 'float', default: 1 })
  difficultyScore: number;

  @Column({ nullable: true })
  lastSeenAt: Date;

  @Column({ nullable: true })
  lastAnswerCorrect: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}