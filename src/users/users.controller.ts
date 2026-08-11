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
  @ApiOperation({ summary: "Open for testing (creating ADMIN account)" })
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
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
  @ResponseMessage('Upload user avatar successfully')
  uploadAvatar(
    @CurrentUser('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(+id, file);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Get all users successfully')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Get users with pagination successfully')
  @Get('paging')
  findPaging(@Query() paginationDto: PaginationDto) {
    return this.usersService.findPaging(paginationDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Search users successfully')
  @Get('search/:name')
  findUserByName(@Param('name') name: string) {
    return this.usersService.findUserByName(name);
  }

  @Public()
  @ResponseMessage('Get user successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Update user successfully')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Delete user successfully')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
