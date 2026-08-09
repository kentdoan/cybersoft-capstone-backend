import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ClearCacheInterceptor } from 'src/common/interceptors/clear-cache.interceptor';
import { ClearCache } from 'src/common/decorators/clear-cache.decorator';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job')
  @Post()
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.jobService.create(createJobDto, userId);
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
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  uploadPicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.jobService.uploadPicture(+id, file);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll() {
    return this.jobService.findAll();
  }

  @Get('paging')
  findPaging(@Query() paginationDto: PaginationDto) {
    return this.jobService.findPaging(paginationDto);
  }

  @Get('list-category')
  findListCategoryWithDetail() {
    return this.jobService.findListCategoryWithDetail();
  }

  @Get('list-category/:id')
  findListCategoryWithDetailByID(@Param('id') id: string) {
    return this.jobService.findListCategoryWithDetailByID(+id);
  }

  @Get('list-detail-job/:detail_subcategory_id')
  findJobByDetailSubcategoryID(
    @Param('detail_subcategory_id') detail_subcategory_id: string,
  ) {
    return this.jobService.findJobByDetailSubcategoryID(+detail_subcategory_id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('detail-job/:id')
  findDetailJobById(@Param('id') id: string) {
    return this.jobService.findDetailJobById(+id);
  }

  @Get('list-detail-job/search/:name')
  findDetailJobByName(@Param('name') name: string) {
    return this.jobService.findDetailJobByName(name);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(+id, updateJobDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobService.remove(+id);
  }
}
