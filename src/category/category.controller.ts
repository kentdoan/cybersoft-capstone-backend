import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/category')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('paging')
  findPaging(@Query() paging: PaginationDto) {
    return this.categoryService.findPaging(paging);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/category', '/api/category/:id')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/category', '/api/category/:id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
