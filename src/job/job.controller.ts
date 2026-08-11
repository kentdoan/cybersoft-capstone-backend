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
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @ApiBearerAuth()
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job')
  @ApiOperation({ summary: '[Require: USER]' })
  @ResponseMessage('Create job successfully')
  @Post()
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.jobService.create(createJobDto, userId);
  }

  @ApiBearerAuth()
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
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
  @ResponseMessage('Upload job picture successfully')
  uploadPicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.jobService.uploadPicture(+id, file, userId, userRole);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get all jobs successfully')
  @Get()
  findAll() {
    return this.jobService.findAll();
  }

  @Public()
  @ResponseMessage('Get jobs with pagination successfully')
  @Get('paging')
  findPaging(@Query() paginationDto: PaginationDto) {
    return this.jobService.findPaging(paginationDto);
  }

  @Public()
  @ResponseMessage('Get list of categories with details successfully')
  @Get('list-category')
  findListCategoryWithDetail() {
    return this.jobService.findListCategoryWithDetail();
  }

  @Public()
  @ResponseMessage('Get category with details successfully')
  @Get('list-category/:id')
  findListCategoryWithDetailByID(@Param('id') id: string) {
    return this.jobService.findListCategoryWithDetailByID(+id);
  }

  @Public()
  @ResponseMessage('Get jobs by detail subcategory successfully')
  @Get('list-detail-job/:detail_subcategory_id')
  findJobByDetailSubcategoryID(
    @Param('detail_subcategory_id') detail_subcategory_id: string,
  ) {
    return this.jobService.findJobByDetailSubcategoryID(+detail_subcategory_id);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get detailed job successfully')
  @Get('detail-job/:id')
  findDetailJobById(@Param('id') id: string) {
    return this.jobService.findDetailJobById(+id);
  }

  @Public()
  @ResponseMessage('Search detailed jobs successfully')
  @Get('list-detail-job/search/:name')
  findDetailJobByName(@Param('name') name: string) {
    return this.jobService.findDetailJobByName(name);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ResponseMessage('Get job successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
  @ResponseMessage('Update job successfully')
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.jobService.update(+id, updateJobDto, userId, userRole);
  }

  @ApiBearerAuth()
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
  @ResponseMessage('Delete job successfully')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.jobService.remove(+id, userId, userRole);
  }
}
