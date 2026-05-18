import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    content: string,
    relatedId?: string,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({ userId, type, content, relatedId });
    return this.notifRepo.save(notif);
  }

  async getForUser(userId: string): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notifId: string): Promise<void> {
    const notif = await this.notifRepo.findOne({ where: { id: notifId, userId } });
    if (!notif) return;
    notif.isRead = true;
    await this.notifRepo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async deleteOne(userId: string, notifId: string): Promise<void> {
    const notif = await this.notifRepo.findOne({ where: { id: notifId, userId } });
    if (!notif) return;
    await this.notifRepo.remove(notif);
    }
}