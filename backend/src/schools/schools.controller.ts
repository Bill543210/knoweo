import { Controller, Get, Query, Post } from '@nestjs/common';
import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.schoolsService.search(query);
  }

  @Post('seed')
  async seed() {
    await this.schoolsService.seed();
    return { message: 'Schools seeded successfully' };
  }
}