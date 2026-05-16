import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) return [];

    const users = await this.usersRepository.find({
      where: [
        { firstName: ILike(`%${query}%`) },
        { lastName: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      select: ['id', 'firstName', 'lastName', 'email', 'avatarUrl', 'isScorePublic'],
      take: 8,
    });

    return users.filter(u => u.id !== currentUserId);
  }
}