import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Question } from '../questions/question.entity';

@Entity()
export class QuestionComment {
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

  // null = commentaire racine, sinon = réponse
  @Column({ nullable: true, type: 'uuid' })
  parentId: string | null;

  @ManyToOne(() => QuestionComment, { nullable: true, onDelete: 'CASCADE' })
  parent: QuestionComment;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}