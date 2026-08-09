import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto, DetailSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateDetailSubcategoryDto, UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory')
  @Post()
  create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoryService.create(createSubcategoryDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll() {
    return this.subcategoryService.findAll();
  }

  @Get('paging')
  findPaging(@Query() pagingSubCategoryDto: PaginationDto){
    return this.subcategoryService.findPaging(pagingSubCategoryDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoryService.update(+id, updateSubcategoryDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoryService.remove(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-picture/:id')
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
  @UseInterceptors(FileInterceptor('file'), ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  uploadPicture(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.subcategoryService.uploadPicture(+id, file);
  }
  

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  @Post(':id/detail')
  @ApiBody({ type: [DetailSubcategoryDto] })
  createListSubCategory(@Body() detailSubCategory: DetailSubcategoryDto[], @Param('id') id: string){
    return this.subcategoryService.createListSubCategory(detailSubCategory, +id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))  
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:subcategory_id')
  @Put(':subcategory_id/detail/:id')
  @ApiBody({ type: UpdateDetailSubcategoryDto })
  updateListSubCategory(@Body() updateDetailSubcategoryDto: UpdateDetailSubcategoryDto, @Param('subcategory_id') subcategory_id: string, @Param('id') id: string){
    return this.subcategoryService.updateListSubCategory(updateDetailSubcategoryDto, +subcategory_id, +id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))  
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:subcategory_id')
  @Delete(':subcategory_id/detail/:id')
  deleteListSubCategory(@Param('subcategory_id') subcategory_id: string, @Param('id') id: string){
    return this.subcategoryService.deleteListSubCategory(+subcategory_id, +id);
  }
}
