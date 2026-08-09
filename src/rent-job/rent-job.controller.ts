import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { RentJobService } from './rent-job.service';
import { CreateRentJobDto } from './dto/create-rent-job.dto';
import { UpdateRentJobDto } from './dto/update-rent-job.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('rent-job')
export class RentJobController {
  constructor(private readonly rentJobService: RentJobService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createRentJobDto: CreateRentJobDto, @CurrentUser('id') clientId: number) {
    return this.rentJobService.create(createRentJobDto, clientId);
  }

  @Get()
  findAll() {
    return this.rentJobService.findAll();
  }

  @Get('paging')
  findPaging(@Query() paging: PaginationDto) {
    return this.rentJobService.findPaging(paging);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('list-jobs-rented')
  findJobRented(@CurrentUser('id') clientId: number) {
    return this.rentJobService.findJobRented(clientId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('complete-job-rented/:id')
  completeJobRented(
    @CurrentUser('id') clientId: number, 
    @Param('id') id: string
  ) {
    return this.rentJobService.completeJobRented(clientId, +id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentJobService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRentJobDto: UpdateRentJobDto) {
    return this.rentJobService.update(+id, updateRentJobDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentJobService.remove(+id);
  }
}
