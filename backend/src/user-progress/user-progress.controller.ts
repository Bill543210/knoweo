import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-progress')
export class UserProgressController {
  constructor(private userProgressService: UserProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: any) {
    return this.userProgressService.getStats(req.user.sub);
  }
}