import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
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
  @ResponseMessage('Create skill successfully')
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get all skills successfully')
  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get skill successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/skill', '/api/skill/:id')
  @ResponseMessage('Update skill successfully')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(+id, updateSkillDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/skill', '/api/skill/:id')
  @ResponseMessage('Delete skill successfully')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillService.remove(+id);
  }
}
