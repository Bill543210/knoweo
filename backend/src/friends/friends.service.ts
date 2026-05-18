import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    private notificationsService: NotificationsService,
  ) {}

  // Envoyer une demande
  async sendRequest(requesterId: string, receiverId: string): Promise<Friendship> {
    // Vérifie si une relation existe déjà
    const existing = await this.friendshipRepo.findOne({
      where: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });
    if (existing) return existing;

    const friendship = this.friendshipRepo.create({
      requesterId, receiverId, status: 'pending',
    });
    const saved = await this.friendshipRepo.save(friendship);

    // Notifie le destinataire
    await this.notificationsService.create(
      receiverId,
      'friend_request',
      'Tu as reçu une demande d\'ami sur Knoweo.',
      requesterId,
    );

    return saved;
  }

  // Accepter une demande
  async acceptRequest(userId: string, requesterId: string): Promise<Friendship | null> {
    const friendship = await this.friendshipRepo.findOne({
      where: { requesterId, receiverId: userId, status: 'pending' },
    });
    if (!friendship) return null;

    friendship.status = 'accepted';
    const saved = await this.friendshipRepo.save(friendship);

    // Notifie celui qui avait envoyé la demande
    await this.notificationsService.create(
      requesterId,
      'friend_accepted',
      'Ta demande d\'ami a été acceptée !',
      userId,
    );

    return saved;
  }

  // Refuser une demande
  async declineRequest(userId: string, requesterId: string): Promise<void> {
    const friendship = await this.friendshipRepo.findOne({
      where: { requesterId, receiverId: userId, status: 'pending' },
    });
    if (!friendship) return;
    friendship.status = 'declined';
    await this.friendshipRepo.save(friendship);
  }

  // Supprimer un ami
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = await this.friendshipRepo.findOne({
      where: [
        { requesterId: userId,    receiverId: friendId, status: 'accepted' },
        { requesterId: friendId,  receiverId: userId,   status: 'accepted' },
      ],
    });
    if (friendship) await this.friendshipRepo.remove(friendship);
  }

  // Liste des amis acceptés avec leurs infos
  async getFriends(userId: string): Promise<any[]> {
  const friendships = await this.friendshipRepo
    .createQueryBuilder('f')
    .leftJoinAndSelect('f.requester', 'requester')
    .leftJoinAndSelect('f.receiver', 'receiver')
    .where('(f.requesterId = :userId OR f.receiverId = :userId)', { userId })
    .andWhere('f.status = :status', { status: 'accepted' })
    .getMany();

  const friends = friendships.map(f => {
    const friend = f.requesterId === userId ? f.receiver : f.requester;
    return {
      id:        friend.id,
      firstName: friend.firstName,
      lastName:  friend.lastName,
      avatarUrl: friend.avatarUrl,
      jobTitle:  friend.jobTitle,
      company:   friend.company,
      isScorePublic: friend.isScorePublic,
      since:     f.updatedAt,
    };
  });

  // Charge les XP pour les amis qui ont isScorePublic = true
  const results = await Promise.all(
    friends.map(async f => {
      if (!f.isScorePublic) return { ...f, totalXP: null };
      const progress = await this.friendshipRepo.manager
        .getRepository('UserProgress')
        .findOne({ where: { userId: f.id } });
      return { ...f, totalXP: progress?.totalXP ?? null };
    }),
  );

  return results;
}

  // Demandes reçues en attente
  async getPendingRequests(userId: string): Promise<any[]> {
    const requests = await this.friendshipRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.requester', 'requester')
      .where('f.receiverId = :userId', { userId })
      .andWhere('f.status = :status', { status: 'pending' })
      .orderBy('f.createdAt', 'DESC')
      .getMany();

    return requests.map(f => ({
      id:        f.requester.id,
      firstName: f.requester.firstName,
      lastName:  f.requester.lastName,
      avatarUrl: f.requester.avatarUrl,
      jobTitle:  f.requester.jobTitle,
      sentAt:    f.createdAt,
    }));
  }

  // Demandes envoyées en attente
  async getSentRequests(userId: string): Promise<any[]> {
    const requests = await this.friendshipRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.requesterId = :userId', { userId })
      .andWhere('f.status = :status', { status: 'pending' })
      .orderBy('f.createdAt', 'DESC')
      .getMany();

    return requests.map(f => ({
      id:        f.receiver.id,
      firstName: f.receiver.firstName,
      lastName:  f.receiver.lastName,
      avatarUrl: f.receiver.avatarUrl,
      sentAt:    f.createdAt,
    }));
  }

  // Statut de relation entre deux users
  async getRelationStatus(userId: string, targetId: string): Promise<string> {
    const f = await this.friendshipRepo.findOne({
      where: [
        { requesterId: userId,   receiverId: targetId },
        { requesterId: targetId, receiverId: userId   },
      ],
    });
    if (!f) return 'none';
    if (f.status === 'accepted') return 'friends';
    if (f.status === 'pending' && f.requesterId === userId) return 'sent';
    if (f.status === 'pending' && f.receiverId === userId)  return 'received';
    return 'none';
  }
}