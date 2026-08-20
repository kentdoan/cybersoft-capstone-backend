import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/skill')
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]',
    description: `Thêm mới một kỹ năng (Skill) vào hệ thống. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Create skill successfully')
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy danh sách toàn bộ các kỹ năng hiện có trong hệ thống. API này là Public, mọi người đều có thể xem.` 
  })
  @ResponseMessage('Get all skills successfully')
  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy thông tin chi tiết của một kỹ năng dựa vào ID. API này là Public, mọi người đều có thể xem.` 
  })
  @ResponseMessage('Get skill successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/skill', '/api/skill/:id')
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]',
    description: `Cập nhật thông tin của một kỹ năng. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Update skill successfully')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(+id, updateSkillDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/skill', '/api/skill/:id')
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]',
    description: `Xóa một kỹ năng khỏi hệ thống. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Delete skill successfully')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillService.remove(+id);
  }
}
