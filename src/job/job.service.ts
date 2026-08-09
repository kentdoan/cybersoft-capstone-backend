import { Injectable } from '@nestjs/common';
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
    const newJob = await this.prisma.job.create({
      data: {
        ...createJobDto,
        user_created: user_created, // ID who created
      },
    });

    return {
      statusCode: 201,
      content: newJob,
      dateTime: new Date().toISOString(),
    };
  }

  async findAll() {
    const jobs = await this.prisma.job.findMany();

    return {
      statusCode: 200,
      content: jobs,
      dateTime: new Date().toISOString(),
    };
  }

  async findOne(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: id },
    });

    return {
      statusCode: 200,
      content: job,
      dateTime: new Date().toISOString(),
    };
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const updatedJob = await this.prisma.job.update({
      where: { id: id },
      data: updateJobDto,
    });

    return {
      statusCode: 200,
      content: updatedJob,
      dateTime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    await this.prisma.job.delete({
      where: { id: id },
    });

    return {
      statusCode: 200,
      content: 'Delete job success',
      dateTime: new Date().toISOString(),
    };
  }

  async findPaging(paging: PaginationDto) {
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;

    const jobs = await this.prisma.job.findMany({
      where: {
        job_name: {
          contains: keyword,
        },
      },
      skip,
      take: pageSize,
    });

    const formattedContent = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalRow: jobs.length,
      keywords: keyword,
      data: jobs,
    };

    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    };
  }

  async findListCategoryWithDetail() {
    const listCategoryWithDetail = await this.prisma.category.findMany({
      include: {
        subcategory: {
          include: {
            detail_subcategory: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      statusCode: 200,
      content: listCategoryWithDetail,
      dateTime: new Date().toISOString(),
    };
  }

  async findListCategoryWithDetailByID(id: number) {
    const listCategoryWithDetailByID = await this.prisma.category.findUnique({
      where: { id: id },
      include: {
        subcategory: {
          include: {
            detail_subcategory: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      statusCode: 200,
      content: listCategoryWithDetailByID,
      dateTime: new Date().toISOString(),
    };
  }

  async findJobByDetailSubcategoryID(id: number) {
    const job = await this.prisma.job.findMany({
      where: { detail_subcategory_id: id },
      include: {
        detail_subcategory: {
          select: {
            name: true,
            subcategory: {
              select: {
                name: true,
                category: {
                  select: {
                    category_name: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedContent = job.map((item) => {
      const {
        detail_subcategory: detailSubcategory,
        users: user,
        ...jobDetail
      } = item;
      return {
        id: item.id,
        job: jobDetail,
        category: detailSubcategory.subcategory.category.category_name,
        subcategory: detailSubcategory.subcategory.name,
        detail_subcategory: detailSubcategory.name,
        name_user_created: user.name,
      };
    });

    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    };
  }

  async findDetailJobById(id: number) {
    const job = await this.prisma.job.findMany({
      where: { id: id },
      include: {
        detail_subcategory: {
          select: {
            name: true,
            subcategory: {
              select: {
                name: true,
                category: {
                  select: {
                    category_name: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedContent = job.map((item) => {
      const {
        detail_subcategory: detailSubcategory,
        users: user,
        ...jobDetail
      } = item;
      return {
        id: item.id,
        job: jobDetail,
        category: detailSubcategory.subcategory.category.category_name,
        subcategory: detailSubcategory.subcategory.name,
        detail_subcategory: detailSubcategory.name,
        name_user_created: user.name,
      };
    });

    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    };
  }

  async findDetailJobByName(name: string) {
    const job = await this.prisma.job.findMany({
      where: { job_name: { contains: name } },
      include: {
        detail_subcategory: {
          select: {
            name: true,
            subcategory: {
              select: {
                name: true,
                category: {
                  select: {
                    category_name: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedContent = job.map((item) => {
      const {
        detail_subcategory: detailSubcategory,
        users: user,
        ...jobDetail
      } = item;
      return {
        id: item.id,
        job: jobDetail,
        category: detailSubcategory.subcategory.category.category_name,
        subcategory: detailSubcategory.subcategory.name,
        detail_subcategory: detailSubcategory.name,
        name_user_created: user.name,
      };
    });

    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    };
  }

  async uploadPicture(id: number, file: Express.Multer.File) {
    const uploadImage = await this.cloudinary.uploadImage(file);

    const updatedJob = await this.prisma.job.update({
      where: { id: id },
      data: {
        picture: uploadImage.secure_url,
      },
    });

    return {
      statusCode: 201,
      content: updatedJob,
      dateTime: new Date().toISOString(),
    };
  }
}
