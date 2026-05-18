import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'badge_earned'
  | 'comment_reply'
  | 'streak_at_risk'
  | 'system';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  type: NotificationType;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  relatedId: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}