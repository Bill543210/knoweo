import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: true })
  isVerified: boolean;
}