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
  @ApiOperation({ 
    summary: '[Yêu cầu: USER]', 
    description: 'Thêm mới một bình luận cho công việc. Yêu cầu người dùng đã đăng nhập (có Token hợp lệ). Hệ thống sẽ tự động lấy ID của người dùng từ Token để làm tác giả của bình luận, đảm bảo tính chính danh.' 
  })
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
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]', 
    description: 'Lấy danh sách toàn bộ bình luận trong hệ thống. Chỉ dành cho tài khoản quản trị viên (ADMIN).' 
  })
  @ResponseMessage('Get all comments successfully')
  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ 
    summary: '[Public]', 
    description: 'Lấy danh sách các bình luận của một công việc (dựa vào ID công việc). API này là Public, bất kỳ ai cũng có thể xem mà không cần đăng nhập.' 
  })
  @ResponseMessage('Get comments by job successfully')
  @Get('comments-by-job/:id')
  findCommentByJobId(@Param('id') id: string) {
    return this.commentService.findCommentByJobId(+id);
  }

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Cập nhật nội dung một bình luận.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể cập nhật những bình luận do **chính mình tạo ra**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể cập nhật **bất kỳ bình luận nào** trong hệ thống.` 
  })
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
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Xóa một bình luận.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể xóa những bình luận do **chính mình tạo ra**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể xóa **bất kỳ bình luận nào** trong hệ thống.` 
  })
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
