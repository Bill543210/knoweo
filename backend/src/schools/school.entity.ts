import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: true })
  isVerified: boolean;
}