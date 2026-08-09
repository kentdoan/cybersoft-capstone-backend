import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateRentJobDto } from './dto/create-rent-job.dto';
import { UpdateRentJobDto } from './dto/update-rent-job.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RentJobService {
  constructor(private prisma: PrismaService) {}

  async create(createRentJobDto: CreateRentJobDto, client_id: number) {
    const newRentJob = await this.prisma.rent_job.create({
      data: {
        ...createRentJobDto,
        client_id: client_id, // user who do this is client
        date_rent: new Date(), // date renting is today
      },
    });

    return {
      statusCode: 201,
      content: newRentJob,
      dateTime: new Date().toISOString(),
    };
  }

  async findAll() {
    const rentJobs = await this.prisma.rent_job.findMany();

    return {
      statusCode: 200,
      content: rentJobs,
      dateTime: new Date().toISOString(),
    };
  }

  async findOne(id: number) {
    const rentJob = await this.prisma.rent_job.findUnique({
      where: { id: id },
    });

    return {
      statusCode: 200,
      content: rentJob,
      dateTime: new Date().toISOString(),
    };
  }

  async update(id: number, updateRentJobDto: UpdateRentJobDto) {
    const updatedRentJob = await this.prisma.rent_job.update({
      where: { id: id },
      data: updateRentJobDto,
    });

    return {
      statusCode: 200,
      content: updatedRentJob,
      dateTime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    await this.prisma.rent_job.delete({
      where: { id: id },
    });

    return {
      statusCode: 200,
      content: 'Delete rent_job success',
      dateTime: new Date().toISOString(),
    };
  }

  async findPaging(paging: PaginationDto){
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;
    
    const rentJobs = await this.prisma.rent_job.findMany({
      where: keyword ? {
        job: {
          job_name: {
            contains: keyword, // Tìm kiếm theo tên công việc được thuê
          }
        }
      } : undefined,
      skip,
      take: pageSize,
    });

    const formattedContent = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalRow: rentJobs.length,
      keywords: keyword,
      data: rentJobs
    }
    
    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    }
  }

  async findJobRented(clientId: number) {
    const rentJobs = await this.prisma.rent_job.findMany({
      where: { client_id: clientId },
      select: {
        id: true,
        job_id: true,
        date_rent: true,
        finish: true,
        // job: true, 
      }
    });

    return {
      statusCode: 200,
      content: rentJobs,
      dateTime: new Date().toISOString(),
    };
  }

  async completeJobRented(clientId: number, job_rented_id: number){
    const rentJob = await this.prisma.rent_job.findFirst({
      where: { 
        id: job_rented_id,
        client_id: clientId
      }
    });

    if (!rentJob) {
      throw new ForbiddenException('Bạn không có quyền cập nhật công việc này hoặc công việc không tồn tại!');
    }

    const completeJobRented = await this.prisma.rent_job.update({
      where: { id: job_rented_id },
      data: {
        finish: true,
      }
    });

    return {
      statusCode: 200,
      content: completeJobRented,
      dateTime: new Date().toISOString(),
    };
  }
}
