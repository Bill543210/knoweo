import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: 'fr' })
  language: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ default: false })
  isScorePublic: boolean;

  @Column({ default: false })
  isProgressPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;
}