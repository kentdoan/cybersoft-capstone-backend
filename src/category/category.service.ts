import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return {
      statusCode: 201,
      content: newCategory,
      dateTime: new Date().toISOString(),
    };
  }

  async findAll() {
    const category = await this.prisma.category.findMany();

    return {
      statusCode: 200,
      content: category,
      dateTime: new Date().toISOString(),
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: id,
      },
    });

    return {
      statusCode: 200,
      content: category,
      dateTime: new Date().toISOString(),
    };
  }

  async findPaging(paging: PaginationDto){
    const { pageIndex = 1, pageSize = 10, keyword } = paging;
    const skip = (pageIndex - 1) * pageSize;
    
    const category = await this.prisma.category.findMany({
      where: {
        category_name: {
          contains: keyword,
        },
      },
      skip,
      take: pageSize,
    });

    const formattedContent = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalRow: category.length,
      keywords: keyword,
      data: category
    }
    
    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const updatedData = await this.prisma.category.update({
      where: {
        id: id,
      },
      data: updateCategoryDto,
    });

    return {
      statusCode: 200,
      content: updatedData,
      dateTime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    await this.prisma.category.delete({
      where: {
        id: id,
      },
    });

    return {
      statusCode: 200,
      content: 'Delete category success',
      dateTime: new Date().toISOString(),
    };
  }
}
