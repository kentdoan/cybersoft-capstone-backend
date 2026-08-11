import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { CreateRentJobDto } from './dto/create-rent-job.dto';
import { UpdateRentJobDto } from './dto/update-rent-job.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RentJobService {
  constructor(private prisma: PrismaService) {}

  async create(createRentJobDto: CreateRentJobDto, client_id: number) {
    return this.prisma.rent_job.create({
      data: {
        ...createRentJobDto,
        client_id, // user who does this is client
        date_rent: new Date(), // date renting is today
      },
    });
  }

  async findAll() {
    return this.prisma.rent_job.findMany();
  }

  async findOne(id: number, userId: number, userRole: Role) {
    const rentJob = await this.prisma.rent_job.findUnique({ where: { id } });
    if (!rentJob) throw new NotFoundException('Rent job not found');
    
    // Check ownership
    if (rentJob.client_id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }
    
    return rentJob;
  }

  async update(id: number, updateRentJobDto: UpdateRentJobDto, userId: number, userRole: Role) {
    const rentJob = await this.prisma.rent_job.findUnique({ where: { id } });
    if (!rentJob) throw new NotFoundException('Rent job not found');
    
    // Check ownership
    if (rentJob.client_id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    return this.prisma.rent_job.update({
      where: { id },
      data: updateRentJobDto,
    });
  }

  async remove(id: number, userId: number, userRole: Role) {
    const rentJob = await this.prisma.rent_job.findUnique({ where: { id } });
    if (!rentJob) throw new NotFoundException('Rent job not found');
    
    // Check ownership
    if (rentJob.client_id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    await this.prisma.rent_job.delete({ where: { id } });
  }

  async findPaging(paging: PaginationDto) {
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;

    const rentJobs = await this.prisma.rent_job.findMany({
      where: keyword
        ? { job: { job_name: { contains: keyword } } }
        : undefined,
      skip,
      take: pageSize,
    });

    return {
      pageIndex,
      pageSize,
      totalRow: rentJobs.length,
      keywords: keyword,
      data: rentJobs,
    };
  }

  async findJobRented(clientId: number) {
    return this.prisma.rent_job.findMany({
      where: { client_id: clientId },
      select: {
        id: true,
        job_id: true,
        date_rent: true,
        finish: true,
      },
    });
  }

  async completeJobRented(clientId: number, job_rented_id: number, userRole: Role) {
    const rentJob = await this.prisma.rent_job.findUnique({
      where: { id: job_rented_id },
    });

    if (!rentJob) throw new NotFoundException('Rent job not found');
    if (rentJob.client_id !== clientId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this job');
    }

    return this.prisma.rent_job.update({
      where: { id: job_rented_id },
      data: { finish: true },
    });
  }
}
