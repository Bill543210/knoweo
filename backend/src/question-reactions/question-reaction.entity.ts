import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Question } from '../questions/question.entity';

export type ReactionTarget = 'question' | 'explanation';
export type ReactionType   = 'like' | 'dislike';

@Entity()
@Unique(['userId', 'questionId', 'target'])
export class QuestionReaction {
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

  @Column()
  target: ReactionTarget;

  @Column()
  type: ReactionType;

  @CreateDateColumn()
  createdAt: Date;
}