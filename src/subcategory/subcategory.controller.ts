import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto, DetailSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateDetailSubcategoryDto, UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}
  
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory')
  @ResponseMessage('Create subcategory successfully')
  @Post()
  create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoryService.create(createSubcategoryDto);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get all subcategories successfully')
  @Get()
  findAll() {
    return this.subcategoryService.findAll();
  }

  @Public()
  @ResponseMessage('Get subcategories with pagination successfully')
  @Get('paging')
  findPaging(@Query() pagingSubCategoryDto: PaginationDto){
    return this.subcategoryService.findPaging(pagingSubCategoryDto);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get subcategory successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  @ResponseMessage('Update subcategory successfully')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoryService.update(+id, updateSubcategoryDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  @ResponseMessage('Delete subcategory successfully')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoryService.remove(+id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
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
  @ResponseMessage('Upload subcategory picture successfully')
  uploadPicture(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.subcategoryService.uploadPicture(+id, file);
  }
  

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:id')
  @ResponseMessage('Create detail subcategories successfully')
  @Post(':id/detail')
  @ApiBody({ type: [DetailSubcategoryDto] })
  createListSubCategory(@Body() detailSubCategory: DetailSubcategoryDto[], @Param('id') id: string){
    return this.subcategoryService.createListSubCategory(detailSubCategory, +id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:subcategory_id')
  @ResponseMessage('Update detail subcategory successfully')
  @Put(':subcategory_id/detail/:id')
  @ApiBody({ type: UpdateDetailSubcategoryDto })
  updateListSubCategory(@Body() updateDetailSubcategoryDto: UpdateDetailSubcategoryDto, @Param('subcategory_id') subcategory_id: string, @Param('id') id: string){
    return this.subcategoryService.updateListSubCategory(updateDetailSubcategoryDto, +subcategory_id, +id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/subcategory', '/api/subcategory/:subcategory_id')
  @ResponseMessage('Delete detail subcategory successfully')
  @Delete(':subcategory_id/detail/:id')
  deleteListSubCategory(@Param('subcategory_id') subcategory_id: string, @Param('id') id: string){
    return this.subcategoryService.deleteListSubCategory(+subcategory_id, +id);
  }
}
