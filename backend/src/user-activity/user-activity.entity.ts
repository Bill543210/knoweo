import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
@Unique(['userId', 'date'])
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // Date au format YYYY-MM-DD — une entrée par jour par user
  @Column({ type: 'date' })
  date: string;

  @Column({ default: 0 })
  questionsAnswered: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  xpEarned: number;

  @CreateDateColumn()
  createdAt: Date;
}