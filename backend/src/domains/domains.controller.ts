import { Controller, Get, Post, Param } from '@nestjs/common';
import { DomainsService } from './domains.service';

@Controller('domains')
export class DomainsController {
  constructor(private domainsService: DomainsService) {}

  @Get()
  async findAll() {
    return this.domainsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.domainsService.findBySlug(slug);
  }

  @Post('seed')
  async seed() {
    await this.domainsService.seed();
    return { message: 'Domains seeded successfully' };
  }
}