import { Controller, Get, Query, Post } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.companiesService.search(query);
  }

  @Post('seed')
  async seed() {
    await this.companiesService.seed();
    return { message: 'Companies seeded successfully' };
  }
}