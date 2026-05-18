import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

@Entity()
@Unique(['requesterId', 'receiverId'])
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  requester: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  receiver: User;

  @Column({ default: 'pending' })
  status: FriendshipStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}