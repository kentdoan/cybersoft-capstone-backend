import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/comment/comments-by-job/:job_id')
  @ApiOperation({ summary: '[Require: USER]' })
  @ResponseMessage('Create comment successfully')
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('id') commentatorId: number,
  ) {
    return this.commentService.create(createCommentDto, commentatorId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Get all comments successfully')
  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get comments by job successfully')
  @Get('comments-by-job/:id')
  findCommentByJobId(@Param('id') id: string) {
    return this.commentService.findCommentByJobId(+id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
  @ResponseMessage('Update comment successfully')
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role
  ) {
    return this.commentService.update(+id, updateCommentDto, userId, userRole);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
  @ResponseMessage('Delete comment successfully')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role
  ) {
    return this.commentService.remove(+id, userId, userRole);
  }
}
