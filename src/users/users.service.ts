import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { excludePassword } from 'src/common/helpers/exclude-password.helper';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }
    const user = await this.prisma.users.create({ data: createUserDto });
    return excludePassword(user);
  }

  async findAll() {
    const users = await this.prisma.users.findMany();
    return users.map(excludePassword);
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return excludePassword(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const user = await this.prisma.users.update({
      where: { id },
      data: updateUserDto,
    });
    return excludePassword(user);
  }

  async remove(id: number) {
    await this.prisma.users.delete({ where: { id } });
  }

  async findPaging(paginationDto: PaginationDto) {
    const { pageIndex = 1, pageSize = 5, keyword = '' } = paginationDto;
    const skip = (pageIndex - 1) * pageSize;

    const listUser = await this.prisma.users.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { email: { contains: keyword } },
        ],
      },
      skip,
      take: pageSize,
    });

    return {
      pageIndex,
      pageSize,
      totalRow: listUser.length,
      keywords: keyword,
      data: listUser.map(excludePassword),
    };
  }

  async findUserByName(name: string) {
    const users = await this.prisma.users.findMany({
      where: { name: { contains: name } },
    });
    return users.map(excludePassword);
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    const uploadAvatar = await this.cloudinary.uploadImage(file);
    const user = await this.prisma.users.update({
      where: { id },
      data: { avatar: uploadAvatar.secure_url },
    });
    return excludePassword(user);
  }
}
