import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { Question } from '../questions/question.entity';

@Entity()
@Unique(['questionId'])
export class QuestionStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  question: Question;

  @Column({ default: 0 })
  totalAttempts: number;

  @Column({ default: 0 })
  correctAttempts: number;

  @Column({ type: 'float', default: 0 })
  successRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}