import { Injectable } from '@nestjs/common';
import {
  CreateSubcategoryDto,
  DetailSubcategoryDto,
} from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto, UpdateDetailSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SubcategoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    const { name, category_id, list_subcategory } = createSubcategoryDto;

    const newSubCategory = await this.prisma.subcategory.create({
      data: {
        name,
        category_id,
        detail_subcategory: {
          create: list_subcategory.map((detail) => ({
            name: detail.name,
          })),
        },
      },
      include: {
        detail_subcategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      statusCode: 201,
      content: newSubCategory,
      datetime: new Date().toISOString(),
    };
  }

  async findAll() {
    const listSubCategory = await this.prisma.subcategory.findMany({
      include: {
        detail_subcategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedListSubCategory = listSubCategory.map((subCategory) => ({
      id: subCategory.id,
      name_category: subCategory.name,
      picture: subCategory.picture,
      category_id: subCategory.category_id,
      detail_subcategory: subCategory.detail_subcategory,
    }));

    return {
      statusCode: 200,
      content: formattedListSubCategory,
      datetime: new Date().toISOString(),
    };
  }

  async findOne(id: number) {
    const subCategory = await this.prisma.subcategory.findMany({
      include: {
        detail_subcategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        id: id,
      },
    });

    return {
      statusCode: 200,
      content: subCategory,
      datetime: new Date().toISOString(),
    };
  }

  async findPaging(paging: PaginationDto) {
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;

    const subCategory = await this.prisma.subcategory.findMany({
      include: {
        detail_subcategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        name: {
          contains: keyword,
        },
      },
      skip,
      take: pageSize,
    });

    const formattedListSubCategory = subCategory.map((subCategory) => ({
      id: subCategory.id,
      name_category: subCategory.name,
      picture: subCategory.picture,
      category_id: subCategory.category_id,
      detail_subcategory: subCategory.detail_subcategory,
    }));

    const formattedPagingList = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalRow: formattedListSubCategory.length,
      keywords: keyword,
      data: formattedListSubCategory,
    };

    return {
      statusCode: 200,
      content: formattedPagingList,
      datetime: new Date().toISOString(),
    };
  }

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    const updatedData = await this.prisma.subcategory.update({
      where: {
        id: id,
      },
      data: updateSubcategoryDto,
    });

    return {
      statusCode: 200,
      content: updatedData,
      datetime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    await this.prisma.subcategory.delete({
      where: {
        id: id,
      },
    });
    return {
      statusCode: 200,
      content: 'Delete success',
      datetime: new Date().toISOString(),
    };
  }

  async createListSubCategory(
    detailSubCategory: DetailSubcategoryDto[],
    id: number,
  ) {
    const newListSubCategory =
      await this.prisma.detail_subcategory.createManyAndReturn({
        data: detailSubCategory.map((detail) => ({
          name: detail.name,
          subcategory_id: id,
        })),
        select: {
          id: true,
          name: true 
        }
      });

    const detailSubCategoryByID =
      await this.prisma.subcategory.findUnique({
        where: {
          id: id,
        },
      });

    const formattedDetailSubCategoryByID = {
      id: id,
      name: detailSubCategoryByID.name,
      category_id: detailSubCategoryByID.category_id,
      detail_subcategory: newListSubCategory,
    }

    return {
      statusCode: 201,
      content: formattedDetailSubCategoryByID,
      datetime: new Date().toISOString(),
    };
  }

  async updateListSubCategory (updateDetailSubcategoryDto: UpdateDetailSubcategoryDto, subcategory_id: number, id: number) {
    const updatedListSubCategory = await this.prisma.detail_subcategory.update({
      where: {
        id: id,
      },
      data: updateDetailSubcategoryDto,
      select: {
        id: true,
        name: true
      }
    });

    const detailSubCategoryByID =
      await this.prisma.subcategory.findUnique({
        where: {
          id: subcategory_id,
        },
      });

    const formattedDetailSubCategoryUpdatedByID = {
      id: subcategory_id,
      name: detailSubCategoryByID.name,
      category_id: detailSubCategoryByID.category_id,
      detail_subcategory: [updatedListSubCategory],
    }

    return {
      statusCode: 200,
      content: formattedDetailSubCategoryUpdatedByID,
      datetime: new Date().toISOString(),
    };
  }

  async deleteListSubCategory (subcategory_id: number, id: number) {
    await this.prisma.detail_subcategory.delete({
      where: {
        id: id,
      },
    });
    return {
      statusCode: 200,
      content: 'Delete success',
      datetime: new Date().toISOString(),
    };
  }

  async uploadPicture (id: number, file: Express.Multer.File) {
    const uploadedData = await this.cloudinary.uploadImage(file);
    
    const updatedSubcategory = await this.prisma.subcategory.update({
      where: { id: id },
      data: { picture: uploadedData.secure_url },
    });

    return {
      statusCode: 201,
      content: updatedSubcategory,
      datetime: new Date().toISOString(),
    };
  }
}
