import { Controller, Get, Put, Post, Body, Request, UseGuards, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Request() req: any, @Body() body: any) {
    return this.usersService.updateUser(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
    @Put('me/password')
    async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
    ) {
    return this.usersService.changePassword(req.user.sub, body.currentPassword, body.newPassword);
    }

  @Get(':id/public')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'avatars'),
      filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${req.user.sub}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req: any, file: any, cb: any) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const isValid = allowedTypes.test(extname(file.originalname).toLowerCase());
      if (isValid) {
        cb(null, true);
      } else {
        cb(new Error('Format non supporté. Utilise JPG, PNG ou WebP.'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.sub, avatarUrl);
  }
}