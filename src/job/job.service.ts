import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createJobDto: CreateJobDto, user_created: number) {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        user_created: user_created,
      },
    });
  }

  async findAll() {
    return this.prisma.job.findMany();
  }

  async findOne(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto, userId: number, userRole: Role) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.user_created !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  async remove(id: number, userId: number, userRole: Role) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.user_created !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    await this.prisma.job.delete({
      where: { id },
    });
  }

  async findPaging(paging: PaginationDto) {
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;

    const jobs = await this.prisma.job.findMany({
      where: { job_name: { contains: keyword } },
      skip,
      take: pageSize,
    });

    return {
      pageIndex,
      pageSize,
      totalRow: jobs.length,
      keywords: keyword,
      data: jobs,
    };
  }

  async findListCategoryWithDetail() {
    return this.prisma.category.findMany({
      include: {
        subcategory: {
          include: {
            detail_subcategory: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findListCategoryWithDetailByID(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategory: {
          include: {
            detail_subcategory: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findJobByDetailSubcategoryID(id: number) {
    const jobs = await this.prisma.job.findMany({
      where: { detail_subcategory_id: id },
      include: {
        detail_subcategory: {
          select: {
            name: true,
            subcategory: {
              select: {
                name: true,
                category: { select: { category_name: true } },
              },
            },
          },
        },
        users: { select: { name: true } },
      },
    });

    return jobs.map((item) => {
      const { detail_subcategory: detailSubcategory, users: user, ...jobDetail } = item;
      return {
        id: item.id,
        job: jobDetail,
        category: detailSubcategory.subcategory.category.category_name,
        subcategory: detailSubcategory.subcategory.name,
        detail_subcategory: detailSubcategory.name,
        name_user_created: user.name,
      };
    });
  }

  async findDetailJobById(id: number) {
    const jobs = await this.prisma.job.findMany({
      where: { id },
      include: {
        detail_subcategory: {
          select: {
            name: true,
            subcategory: {
              select: {
                name: true,
                category: { select: { category_name: true } },
              },
            },
          },
        },
        users: { select: { name: true } },
      },
    });

    return jobs.map((item) => {
      const { detail_subcategory: detailSubcategory, users: user, ...jobDetail } = item;
      return {
        id: item.id,
        job: jobDetail,
        category: detailSubcategory.subcategory.category.category_name,
        subcategory: detailSubcategory.subcategory.name,
        detail_subcategory: detailSubcategory.name,
        name_user_created: user.name,
      };
    });
  }

  async findDetailJobByName(name: string) {
    const jobs = await this.prisma.job.findMany({
      where: { job_name: { contains: name } },
      include: {
        detail_subcategory: {
          select: {
            name: true,
            subcategory: {
              select: {
                name: true,
                category: { select: { category_name: true } },
              },
            },
          },
        },
        users: { select: { name: true } },
      },
    });

    return jobs.map((item) => {
      const { detail_subcategory: detailSubcategory, users: user, ...jobDetail } = item;
      return {
        id: item.id,
        job: jobDetail,
        category: detailSubcategory.subcategory.category.category_name,
        subcategory: detailSubcategory.subcategory.name,
        detail_subcategory: detailSubcategory.name,
        name_user_created: user.name,
      };
    });
  }

  async uploadPicture(id: number, file: Express.Multer.File, userId: number, userRole: Role) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.user_created !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    const uploadImage = await this.cloudinary.uploadImage(file);

    return this.prisma.job.update({
      where: { id },
      data: { picture: uploadImage.secure_url },
    });
  }
}
