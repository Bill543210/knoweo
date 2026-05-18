import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionReaction, ReactionTarget, ReactionType } from './question-reaction.entity';
import { QuestionComment } from '../question-comments/question-comment.entity';
import { CommentReaction } from '../question-comments/comment-reaction.entity';
import { User } from '../users/user.entity';

@Injectable()
export class QuestionReactionsService {
  constructor(
    @InjectRepository(QuestionReaction)
    private reactionRepo: Repository<QuestionReaction>,
    @InjectRepository(QuestionComment)
    private commentRepo: Repository<QuestionComment>,
    @InjectRepository(CommentReaction)
    private commentReactionRepo: Repository<CommentReaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Like ou dislike une question ou une explication
  // Si déjà liké avec le même type → annule (toggle)
  // Si déjà liké avec un type différent → change
  async toggleReaction(
    userId: string,
    questionId: string,
    target: ReactionTarget,
    type: ReactionType,
  ): Promise<{ action: 'added' | 'removed' | 'changed'; type: ReactionType | null }> {
    const existing = await this.reactionRepo.findOne({
      where: { userId, questionId, target },
    });

    if (!existing) {
      await this.reactionRepo.save(
        this.reactionRepo.create({ userId, questionId, target, type })
      );
      return { action: 'added', type };
    }

    if (existing.type === type) {
      // Même type → annule
      await this.reactionRepo.remove(existing);
      return { action: 'removed', type: null };
    }

    // Type différent → change
    existing.type = type;
    await this.reactionRepo.save(existing);
    return { action: 'changed', type };
  }

  // Récupère les réactions d'un user pour une question
  async getUserReactions(userId: string, questionId: string): Promise<{
    question: ReactionType | null;
    explanation: ReactionType | null;
  }> {
    const reactions = await this.reactionRepo.find({
      where: { userId, questionId },
    });
    return {
      question: reactions.find(r => r.target === 'question')?.type || null,
      explanation: reactions.find(r => r.target === 'explanation')?.type || null,
    };
  }

  // Compte les likes/dislikes globaux pour une question
  async getReactionCounts(questionId: string): Promise<{
    questionLikes: number;
    questionDislikes: number;
    explanationLikes: number;
    explanationDislikes: number;
  }> {
    const all = await this.reactionRepo.find({ where: { questionId } });
    return {
      questionLikes:      all.filter(r => r.target === 'question'    && r.type === 'like').length,
      questionDislikes:   all.filter(r => r.target === 'question'    && r.type === 'dislike').length,
      explanationLikes:   all.filter(r => r.target === 'explanation' && r.type === 'like').length,
      explanationDislikes:all.filter(r => r.target === 'explanation' && r.type === 'dislike').length,
    };
  }

  // ── COMMENTAIRES ─────────────────────────────────────────

async getComments(questionId: string, currentUserId: string): Promise<any[]> {
  const comments = await this.commentRepo
    .createQueryBuilder('c')
    .leftJoinAndSelect('c.user', 'user')
    .where('c.questionId = :questionId', { questionId })
    .andWhere('c.isDeleted = false')
    .orderBy('c.createdAt', 'ASC')
    .getMany();

  const roots   = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => !!c.parentId);

  return roots.map(root => ({
    ...this.formatComment(root),
    replies: replies
      .filter(r => r.parentId === root.id)
      .map(r => this.formatComment(r)),
  }));
}

private formatComment(c: QuestionComment) {
  return {
    id:           c.id,
    content:      c.content,
    likeCount:    c.likeCount,
    dislikeCount: c.dislikeCount,
    createdAt:    c.createdAt,
    parentId:     c.parentId,
    author: {
      id:        (c.user as any)?.id        || '',
      firstName: (c.user as any)?.firstName || 'Utilisateur',
      lastName:  (c.user as any)?.lastName  || '',
      photo:     (c.user as any)?.photo     || null,
    },
  };
}

async addComment(
  userId: string,
  questionId: string,
  content: string,
  parentId?: string,
): Promise<QuestionComment> {
  const comment = this.commentRepo.create();
  comment.userId     = userId;
  comment.questionId = questionId;
  comment.content    = content.trim();
  comment.parentId   = parentId || null;
  comment.likeCount    = 0;
  comment.dislikeCount = 0;
  comment.isDeleted    = false;
  return this.commentRepo.save(comment) as Promise<QuestionComment>;
}

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment || comment.userId !== userId) return;
    comment.isDeleted = true;
    comment.content = '[commentaire supprimé]';
    await this.commentRepo.save(comment);
  }

  async toggleCommentReaction(
    userId: string,
    commentId: string,
    type: 'like' | 'dislike',
  ): Promise<void> {
    const existing = await this.commentReactionRepo.findOne({
      where: { userId, commentId },
    });

    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) return;

    if (!existing) {
      await this.commentReactionRepo.save(
        this.commentReactionRepo.create({ userId, commentId, type })
      );
      if (type === 'like') comment.likeCount += 1;
      else comment.dislikeCount += 1;
    } else if (existing.type === type) {
      await this.commentReactionRepo.remove(existing);
      if (type === 'like') comment.likeCount = Math.max(0, comment.likeCount - 1);
      else comment.dislikeCount = Math.max(0, comment.dislikeCount - 1);
    } else {
      if (existing.type === 'like') {
        comment.likeCount = Math.max(0, comment.likeCount - 1);
        comment.dislikeCount += 1;
      } else {
        comment.dislikeCount = Math.max(0, comment.dislikeCount - 1);
        comment.likeCount += 1;
      }
      existing.type = type;
      await this.commentReactionRepo.save(existing);
    }
    await this.commentRepo.save(comment);
  }
}