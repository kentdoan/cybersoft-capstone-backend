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
  @ApiOperation({ summary: '[Require: USER]' })
  @ResponseMessage('Create rent job successfully')
  @Post()
  create(@Body() createRentJobDto: CreateRentJobDto, @CurrentUser('id') clientId: number) {
    return this.rentJobService.create(createRentJobDto, clientId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Get all rent jobs successfully')
  @Get()
  findAll() {
    return this.rentJobService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ResponseMessage('Get rent jobs with pagination successfully')
  @Get('paging')
  findPaging(@Query() paging: PaginationDto) {
    return this.rentJobService.findPaging(paging);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '[Require: (owning) USER]' })
  @ResponseMessage('Get jobs rented by user successfully')
  @Get('list-jobs-rented')
  findJobRented(@CurrentUser('id') clientId: number) {
    return this.rentJobService.findJobRented(clientId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
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
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
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
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
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
  @ApiOperation({ summary: '[Require: ADMIN, (owning) USER]' })
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
