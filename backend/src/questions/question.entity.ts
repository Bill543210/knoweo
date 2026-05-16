import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Domain } from '../domains/domain.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Domain, { onDelete: 'CASCADE' })
  domain: Domain;

  @Column()
  domainId: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'text' })
  textFr: string;

  @Column({ type: 'text' })
  textEn: string;

  @Column({ type: 'jsonb' })
  propositionsFr: { text: string; correct: boolean }[];

  @Column({ type: 'jsonb' })
  propositionsEn: { text: string; correct: boolean }[];

  @Column({ type: 'text' })
  explanationFr: string;

  @Column({ type: 'text' })
  explanationEn: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}