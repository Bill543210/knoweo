import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ default: 0 })
  totalXP: number;

  @Column({ default: 0 })
  currentStreak: number;

  @Column({ default: 0 })
  maxStreak: number;

  @Column({ default: 0 })
  questionsAnswered: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  battlesPlayed: number;

  @Column({ default: 0 })
  battlesWon: number;

  @Column({ default: 0 })
  totalTimeMinutes: number;

  @Column({ nullable: true })
  lastActivityDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}