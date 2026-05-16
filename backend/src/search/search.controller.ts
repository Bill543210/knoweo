import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async searchUsers(@Query('q') query: string, @Request() req: any) {
    return this.searchService.searchUsers(query, req.user.sub);
  }
}