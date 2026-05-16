import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserStatus {
  STUDENT = 'student',
  PROFESSIONAL = 'professional',
  OTHER = 'other',
}

export enum EducationLevel {
  BACHELOR = 'bachelor',
  MASTER = 'master',
  MASTER_SPECIALIZED = 'master_specialized',
  MBA = 'mba',
  PHD = 'phd',
  OTHER = 'other',
}

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

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ default: 'fr' })
  language: string;

  @Column({ default: false })
  isScorePublic: boolean;

  @Column({ default: false })
  isProgressPublic: boolean;

  // Infos personnelles
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true, length: 1000 })
  bio: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true, type: 'varchar', default: UserStatus.STUDENT })
  status: string;

  // Infos études
  @Column({ nullable: true })
  lastSchool: string;

  @Column({ nullable: true, type: 'varchar' })
  educationLevel: string;

  @Column({ nullable: true })
  fieldOfStudy: string;

  // Infos professionnelles
  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  yearsOfExperience: number;

  @Column({ nullable: true })
  salary: number;

  @Column({ nullable: true, default: 'EUR' })
  salaryCurrency: string;

  @Column({ nullable: true })
  workCountry: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, default: 'FR' })
  phoneCountryCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}