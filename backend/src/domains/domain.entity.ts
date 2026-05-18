import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Domain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  // Catégorie parente : 'finance', 'data', 'economie', 'strategy', etc.
  @Column({ default: 'finance' })
  category: string;

  @Column()
  nameFr: string;

  @Column()
  nameEn: string;

  @Column({ nullable: true })
  descriptionFr: string;

  @Column({ nullable: true })
  descriptionEn: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}