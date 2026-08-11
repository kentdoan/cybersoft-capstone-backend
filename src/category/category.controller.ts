import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/category')
  @ResponseMessage('Create category successfully')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get all categories successfully')
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Public()
  @ResponseMessage('Get categories with pagination successfully')
  @Get('paging')
  findPaging(@Query() paging: PaginationDto) {
    return this.categoryService.findPaging(paging);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get category successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/category', '/api/category/:id')
  @ResponseMessage('Update category successfully')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/category', '/api/category/:id')
  @ResponseMessage('Delete category successfully')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
