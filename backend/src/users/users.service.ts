import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(firstName: string, lastName: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async findPublicById(id: string): Promise<Partial<User> | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      city: user.city,
      country: user.country,
      status: user.status,
      lastSchool: user.lastSchool,
      educationLevel: user.educationLevel,
      fieldOfStudy: user.fieldOfStudy,
      company: user.company,
      jobTitle: user.jobTitle,
      yearsOfExperience: user.yearsOfExperience,
      linkedinUrl: user.linkedinUrl,
      isScorePublic: user.isScorePublic,
      isProgressPublic: user.isProgressPublic,
      createdAt: user.createdAt,
    };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User | null> {
    await this.usersRepository.update(id, { avatarUrl });
    return this.findById(id);
  }
}