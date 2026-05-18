import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { QuestionComment } from './question-comment.entity';

@Entity()
@Unique(['userId', 'commentId'])
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  commentId: string;

  @ManyToOne(() => QuestionComment, { onDelete: 'CASCADE' })
  comment: QuestionComment;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}