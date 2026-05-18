import {
  Controller, Get, Post, Delete,
  Param, Req, UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  private uid(req: any) { return req.user.sub || req.user.userId; }

  @Get()
  getFriends(@Req() req: any) {
    return this.friendsService.getFriends(this.uid(req));
  }

  @Get('requests')
  getPendingRequests(@Req() req: any) {
    return this.friendsService.getPendingRequests(this.uid(req));
  }

  @Get('sent')
  getSentRequests(@Req() req: any) {
    return this.friendsService.getSentRequests(this.uid(req));
  }

  @Get('status/:targetId')
  getStatus(@Req() req: any, @Param('targetId') targetId: string) {
    return this.friendsService.getRelationStatus(this.uid(req), targetId);
  }

  @Post('request/:userId')
  sendRequest(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.sendRequest(this.uid(req), userId);
  }

  @Post('accept/:userId')
  acceptRequest(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.acceptRequest(this.uid(req), userId);
  }

  @Post('decline/:userId')
  declineRequest(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.declineRequest(this.uid(req), userId);
  }

  @Delete(':userId')
  removeFriend(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.removeFriend(this.uid(req), userId);
  }
}