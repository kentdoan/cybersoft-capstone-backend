import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @ApiOperation({ 
    summary: '[Public]', 
    description: `Tạo tài khoản người dùng hoặc quản trị viên mới. 
API này đang được mở công khai để phục vụ mục đích kiểm thử (dễ dàng tạo tài khoản ADMIN).`
  })
  @ResponseMessage('Create user successfully')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @Post('upload-avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Cập nhật ảnh đại diện cho tài khoản.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể cập nhật ảnh đại diện của **chính mình**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể cập nhật ảnh đại diện của **bất kỳ người dùng nào** trong hệ thống.`
  })
  @ResponseMessage('Upload user avatar successfully')
  uploadAvatar(
    @CurrentUser('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(+id, file);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]', 
    description: `Lấy danh sách toàn bộ người dùng trong hệ thống. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Get all users successfully')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]', 
    description: `Lấy danh sách người dùng có phân trang và tìm kiếm theo từ khóa. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Get users with pagination successfully')
  @Get('paging')
  findPaging(@Query() paginationDto: PaginationDto) {
    return this.usersService.findPaging(paginationDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]', 
    description: `Tìm kiếm danh sách người dùng theo tên. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Search users successfully')
  @Get('search/:name')
  findUserByName(@Param('name') name: string) {
    return this.usersService.findUserByName(name);
  }

  @Public()
  @ApiOperation({ 
    summary: '[Public]', 
    description: `Lấy thông tin chi tiết của một người dùng bất kỳ dựa vào ID. Mọi người đều có thể xem mà không cần đăng nhập.` 
  })
  @ResponseMessage('Get user successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]', 
    description: `Cập nhật thông tin của bất kỳ người dùng nào trong hệ thống. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Update user successfully')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]', 
    description: `Xóa một người dùng khỏi hệ thống. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Delete user successfully')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
