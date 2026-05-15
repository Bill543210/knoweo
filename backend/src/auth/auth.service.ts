import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(firstName: string, lastName: string, email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    const user = await this.usersService.create(firstName, lastName, email, password);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }, token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }, token };
  }
}