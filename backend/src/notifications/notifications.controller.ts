import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private uid(req: any) { return req.user.sub || req.user.userId; }

  @Get()
  getAll(@Req() req: any) {
    return this.notificationsService.getForUser(this.uid(req));
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(this.uid(req));
  }

  @Post('read-all')
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(this.uid(req));
  }

  @Post(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(this.uid(req), id);
  }

  @Delete(':id')
    async deleteNotif(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.deleteOne(this.uid(req), id);
    }
}