import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.prisma.users.create({
      data: createUserDto,
    });

    return {
      statusCode: 201,
      content: createUserDto,
      dateTime: new Date().toISOString(),
    };
  }

  async findAll() {
    const listUser = await this.prisma.users.findMany();

    return {
      statusCode: 200,
      content: listUser,
      dateTime: new Date().toISOString(),
    };
  }

  async findOne(id: number) {
    const userByID = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    return {
      statusCode: 200,
      content: userByID,
      dateTime: new Date().toISOString(),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.prisma.users.update({
      where: {
        id: id,
      },
      data: updateUserDto,
    });

    return {
      statusCode: 200,
      content: updateUserDto,
      dateTime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    await this.prisma.users.delete({
      where: {
        id: id,
      },
    });

    return {
      statusCode: 200,
      message: 'Delete sucessfully',
      content: null,
      dateTime: new Date().toISOString(),
    };
  }

  async findPaging(paginationDto: PaginationDto) {
    const { pageIndex = 1, pageSize = 5, keyword = '' } = paginationDto;
    const skip = (pageIndex - 1) * pageSize;

    const listUser = await this.prisma.users.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
            },
          },
          {
            email: {
              contains: keyword,
            },
          },
        ],
      },
      skip,
      take: pageSize,
    });

    const formattedContent = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalRow: listUser.length,
      keywords: keyword,
      data: listUser,
    };

    return {
      statusCode: 200,
      content: formattedContent,
      dateTime: new Date().toISOString(),
    };
  }

  async findUserByName(name: string) {
    const listUser = await this.prisma.users.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });

    return {
      statusCode: 200,
      content: listUser,
      dateTime: new Date().toISOString(),
    };
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    const uploadAvatar = await this.cloudinary.uploadImage(file);
    const updateUser = await this.prisma.users.update({
      where: {
        id: id,
      },
      data: {
        avatar: uploadAvatar.secure_url,
      },
    });
    return {
      statusCode: 200,
      content: updateUser,
      dateTime: new Date().toISOString(),
    };
  }
}
