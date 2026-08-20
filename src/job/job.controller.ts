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
  @ApiOperation({ 
    summary: '[Yêu cầu: USER]',
    description: `Tạo một công việc mới.
    
Yêu cầu người dùng đã đăng nhập. Hệ thống tự động gán tài khoản hiện tại làm người tạo công việc.` 
  })
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
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Tải lên hình ảnh minh họa cho công việc.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể tải ảnh lên cho những công việc do **chính mình tạo ra**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể tải ảnh lên cho **bất kỳ công việc nào** trong hệ thống.`
  })
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
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy danh sách toàn bộ công việc. API này là Public, mọi người đều có thể xem.` 
  })
  @ResponseMessage('Get all jobs successfully')
  @Get()
  findAll() {
    return this.jobService.findAll();
  }

  @Public()
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy danh sách công việc có phân trang. API này là Public, mọi người đều có thể xem.` 
  })
  @ResponseMessage('Get jobs with pagination successfully')
  @Get('paging')
  findPaging(@Query() paginationDto: PaginationDto) {
    return this.jobService.findPaging(paginationDto);
  }

  @Public()
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy danh sách menu loại công việc kèm theo chi tiết. API này là Public.` 
  })
  @ResponseMessage('Get list of categories with details successfully')
  @Get('list-category')
  findListCategoryWithDetail() {
    return this.jobService.findListCategoryWithDetail();
  }

  @Public()
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy thông tin chi tiết của một loại công việc (bao gồm các nhóm chi tiết) dựa vào ID. API này là Public.` 
  })
  @ResponseMessage('Get category with details successfully')
  @Get('list-category/:id')
  findListCategoryWithDetailByID(@Param('id') id: string) {
    return this.jobService.findListCategoryWithDetailByID(+id);
  }

  @Public()
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy danh sách các công việc thuộc về một nhóm chi tiết loại công việc cụ thể. API này là Public.` 
  })
  @ResponseMessage('Get jobs by detail subcategory successfully')
  @Get('list-detail-job/:detail_subcategory_id')
  findJobByDetailSubcategoryID(
    @Param('detail_subcategory_id') detail_subcategory_id: string,
  ) {
    return this.jobService.findJobByDetailSubcategoryID(+detail_subcategory_id);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy thông tin chi tiết toàn diện của một công việc dựa vào ID (bao gồm thông tin người tạo, loại công việc, v.v.). API này là Public.` 
  })
  @ResponseMessage('Get detailed job successfully')
  @Get('detail-job/:id')
  findDetailJobById(@Param('id') id: string) {
    return this.jobService.findDetailJobById(+id);
  }

  @Public()
  @ApiOperation({ 
    summary: '[Public]',
    description: `Tìm kiếm danh sách chi tiết các công việc dựa theo tên. API này là Public.` 
  })
  @ResponseMessage('Search detailed jobs successfully')
  @Get('list-detail-job/search/:name')
  findDetailJobByName(@Param('name') name: string) {
    return this.jobService.findDetailJobByName(name);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ 
    summary: '[Public]',
    description: `Lấy thông tin cơ bản của một công việc dựa vào ID. API này là Public.` 
  })
  @ResponseMessage('Get job successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseInterceptors(ClearCacheInterceptor)
  @ClearCache('/api/job', '/api/job/:id', '/api/job/detail-job/:id')
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Cập nhật thông tin của một công việc.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể cập nhật những công việc do **chính mình tạo ra**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể cập nhật **bất kỳ công việc nào** trong hệ thống.`
  })
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
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Xóa một công việc.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể xóa những công việc do **chính mình tạo ra**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể xóa **bất kỳ công việc nào** trong hệ thống.`
  })
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
