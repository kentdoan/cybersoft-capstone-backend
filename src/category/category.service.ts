import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({ data: createCategoryDto });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findPaging(paging: PaginationDto) {
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;

    const category = await this.prisma.category.findMany({
      where: { category_name: { contains: keyword } },
      skip,
      take: pageSize,
    });

    return {
      pageIndex,
      pageSize,
      totalRow: category.length,
      keywords: keyword,
      data: category,
    };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.prisma.category.delete({ where: { id } });
  }
}
