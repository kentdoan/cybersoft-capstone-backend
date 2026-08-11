import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSubcategoryDto,
  DetailSubcategoryDto,
} from './dto/create-subcategory.dto';
import {
  UpdateSubcategoryDto,
  UpdateDetailSubcategoryDto,
} from './dto/update-subcategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SubcategoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    const { name, category_id, list_subcategory } = createSubcategoryDto;

    const category = await this.prisma.category.findUnique({
      where: { id: category_id },
    });
    if (!category)
      throw new NotFoundException(`Category with id ${category_id} not found`);

    return this.prisma.subcategory.create({
      data: {
        name,
        category_id,
        detail_subcategory: {
          create: list_subcategory.map((detail) => ({ name: detail.name })),
        },
      },
      include: {
        detail_subcategory: { select: { id: true, name: true } },
      },
    });
  }

  async findAll() {
    const listSubCategory = await this.prisma.subcategory.findMany({
      include: {
        detail_subcategory: { select: { id: true, name: true } },
      },
    });

    return listSubCategory.map((subCategory) => ({
      id: subCategory.id,
      name_category: subCategory.name,
      picture: subCategory.picture,
      category_id: subCategory.category_id,
      detail_subcategory: subCategory.detail_subcategory,
    }));
  }

  async findOne(id: number) {
    const subCategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: {
        detail_subcategory: { select: { id: true, name: true } },
      },
    });

    if (!subCategory)
      throw new NotFoundException(`Subcategory with id ${id} not found`);
    return subCategory;
  }

  async findPaging(paging: PaginationDto) {
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;

    const subCategory = await this.prisma.subcategory.findMany({
      include: {
        detail_subcategory: { select: { id: true, name: true } },
      },
      where: { name: { contains: keyword } },
      skip,
      take: pageSize,
    });

    const formattedList = subCategory.map((item) => ({
      id: item.id,
      name_category: item.name,
      picture: item.picture,
      category_id: item.category_id,
      detail_subcategory: item.detail_subcategory,
    }));

    return {
      pageIndex,
      pageSize,
      totalRow: formattedList.length,
      keywords: keyword,
      data: formattedList,
    };
  }

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.prisma.subcategory.update({
      where: { id },
      data: updateSubcategoryDto,
    });
  }

  async remove(id: number) {
    await this.prisma.subcategory.delete({ where: { id } });
  }

  async createListSubCategory(
    detailSubCategory: DetailSubcategoryDto[],
    id: number,
  ) {
    const subCategory = await this.prisma.subcategory.findUnique({ where: { id } });
    if (!subCategory)
      throw new NotFoundException(`Subcategory with id ${id} not found`);

    const newListSubCategory =
      await this.prisma.detail_subcategory.createManyAndReturn({
        data: detailSubCategory.map((detail) => ({
          name: detail.name,
          subcategory_id: id,
        })),
        select: { id: true, name: true },
      });

    return {
      id,
      name: subCategory.name,
      category_id: subCategory.category_id,
      detail_subcategory: newListSubCategory,
    };
  }

  async updateListSubCategory(
    updateDetailSubcategoryDto: UpdateDetailSubcategoryDto,
    subcategory_id: number,
    id: number,
  ) {

    const subCategory = await this.prisma.subcategory.findUnique({
      where: { id: subcategory_id },
    });
    if (!subCategory)
      throw new NotFoundException(
        `Subcategory with id ${subcategory_id} not found`,
      );

    const updatedItem = await this.prisma.detail_subcategory.update({
      where: { id },
      data: updateDetailSubcategoryDto,
      select: { id: true, name: true },
    });

    return {
      id: subcategory_id,
      name: subCategory.name,
      category_id: subCategory.category_id,
      detail_subcategory: [updatedItem],
    };
  }

  async deleteListSubCategory(subcategory_id: number, id: number) {
    await this.prisma.detail_subcategory.delete({ where: { id } });
  }

  async uploadPicture(id: number, file: Express.Multer.File) {
    const uploadedData = await this.cloudinary.uploadImage(file);
    return this.prisma.subcategory.update({
      where: { id },
      data: { picture: uploadedData.secure_url },
    });
  }
}
