import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { RentJobService } from './rent-job.service';
import { CreateRentJobDto } from './dto/create-rent-job.dto';
import { UpdateRentJobDto } from './dto/update-rent-job.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('rent-job')
export class RentJobController {
  constructor(private readonly rentJobService: RentJobService) {}

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: USER]',
    description: `Thuê một công việc mới.
    
Yêu cầu người dùng đã đăng nhập. Hệ thống tự động gán tài khoản hiện tại làm người thuê công việc.` 
  })
  @ResponseMessage('Create rent job successfully')
  @Post()
  create(@Body() createRentJobDto: CreateRentJobDto, @CurrentUser('id') clientId: number) {
    return this.rentJobService.create(createRentJobDto, clientId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]',
    description: `Lấy danh sách toàn bộ các lượt thuê công việc. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Get all rent jobs successfully')
  @Get()
  findAll() {
    return this.rentJobService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN]',
    description: `Lấy danh sách các lượt thuê công việc có phân trang. Chỉ dành cho tài khoản quản trị viên.` 
  })
  @ResponseMessage('Get rent jobs with pagination successfully')
  @Get('paging')
  findPaging(@Query() paging: PaginationDto) {
    return this.rentJobService.findPaging(paging);
  }

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: Chủ sở hữu]',
    description: `Lấy danh sách các công việc mà người dùng hiện tại đã thuê. 
    
Hệ thống tự động lọc theo ID của người dùng đang đăng nhập.` 
  })
  @ResponseMessage('Get jobs rented by user successfully')
  @Get('list-jobs-rented')
  findJobRented(@CurrentUser('id') clientId: number) {
    return this.rentJobService.findJobRented(clientId);
  }

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Đánh dấu hoàn thành một công việc đã thuê.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể hoàn thành những công việc do **chính mình thuê**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể đánh dấu hoàn thành **bất kỳ lượt thuê nào** trong hệ thống.`
  })
  @ResponseMessage('Complete rented job successfully')
  @Post('complete-job-rented/:id')
  completeJobRented(
    @CurrentUser('id') clientId: number, 
    @CurrentUser('role') userRole: Role,
    @Param('id') id: string
  ) {
    return this.rentJobService.completeJobRented(clientId, +id, userRole);
  }

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Lấy thông tin chi tiết của một lượt thuê công việc.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể xem thông tin lượt thuê của **chính mình**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể xem thông tin của **bất kỳ lượt thuê nào** trong hệ thống.`
  })
  @ResponseMessage('Get rent job successfully')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role
  ) {
    return this.rentJobService.findOne(+id, userId, userRole);
  }

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Cập nhật thông tin của một lượt thuê công việc.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể cập nhật lượt thuê của **chính mình**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể cập nhật **bất kỳ lượt thuê nào** trong hệ thống.`
  })
  @ResponseMessage('Update rent job successfully')
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateRentJobDto: UpdateRentJobDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role
  ) {
    return this.rentJobService.update(+id, updateRentJobDto, userId, userRole);
  }

  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[Yêu cầu: ADMIN, Chủ sở hữu]',
    description: `Xóa một lượt thuê công việc khỏi hệ thống.

**Yêu cầu phân quyền**:

- **Người dùng thông thường (USER)**: Chỉ có thể xóa lượt thuê của **chính mình**.

- **Quản trị viên (ADMIN)**: Được cấp quyền tối thượng, có thể xóa **bất kỳ lượt thuê nào** trong hệ thống.`
  })
  @ResponseMessage('Delete rent job successfully')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role
  ) {
    return this.rentJobService.remove(+id, userId, userRole);
  }
}
