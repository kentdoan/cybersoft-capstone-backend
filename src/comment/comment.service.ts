import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, commentator_id: number) {
    const newComment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        commentator_id: commentator_id,
        date_comment: new Date(),
      },
    });

    return {
      statusCode: 201,
      content: newComment,
      dateTime: new Date().toISOString(),
    };
  }

  async findAll() {
    const comments = await this.prisma.comment.findMany();

    return {
      statusCode: 200,
      content: comments,
      dateTime: new Date().toISOString(),
    };
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const updatedComment = await this.prisma.comment.update({
      where: { id: id },
      data: updateCommentDto,
    });

    return {
      statusCode: 200,
      content: updatedComment,
      dateTime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    await this.prisma.comment.delete({
      where: { id: id },
    });

    return {
      statusCode: 200,
      content: 'Delete comment success',
      dateTime: new Date().toISOString(),
    };
  }

  async findCommentByJobId(job_id: number) {
    const comments = await this.prisma.comment.findMany({
      where: { job_id: job_id },
      include: {
        users: {
          select: {
            name: true,
            avatar: true
          },
        },
      },
    });

    const formattedContent = comments.map((comment) => {
      const {users: User, job_id: JobId, ...rest} = comment
      return {
        id: rest.id,
        date_comment: rest.date_comment,
        content: rest.content,
        stars: rest.stars,
        user_commented: User.name,
        avatar: User.avatar
      }
    })

    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    };
  }
}
