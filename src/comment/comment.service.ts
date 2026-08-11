import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, commentator_id: number) {
    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        commentator_id,
        date_comment: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.comment.findMany();
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.commentator_id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
    });
  }

  async remove(id: number, userId: number, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.commentator_id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    await this.prisma.comment.delete({ where: { id } });
  }

  async findCommentByJobId(job_id: number) {
    const comments = await this.prisma.comment.findMany({
      where: { job_id },
      include: {
        users: {
          select: { name: true, avatar: true },
        },
      },
    });

    return comments.map((comment) => {
      const { users: User, job_id: _jobId, ...rest } = comment;
      return {
        id: rest.id,
        date_comment: rest.date_comment,
        content: rest.content,
        stars: rest.stars,
        user_commented: User.name,
        avatar: User.avatar,
      };
    });
  }
}
