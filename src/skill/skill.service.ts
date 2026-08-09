import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async create(createSkillDto: CreateSkillDto) {
    const newSkill = await this.prisma.skill.create({
      data: createSkillDto,
    });
    return {
      statusCode: 201,
      content: newSkill,
      dateTime: new Date().toISOString(),
    };
  }

  async findAll() {
    const listSkill = await this.prisma.skill.findMany();

    return {
      statusCode: 200,
      content: listSkill,
      dateTime: new Date().toISOString(),
    };
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');
    return {
      statusCode: 200,
      content: skill,
      dateTime: new Date().toISOString(),
    };
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    const updatedSkill = await this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });
    return {
      statusCode: 200,
      content: updatedSkill,
      dateTime: new Date().toISOString(),
    };
  }

  async remove(id: number) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    await this.prisma.skill.delete({ where: { id } });
    return {
      statusCode: 200,
      content: 'Deleted successfully',
      dateTime: new Date().toISOString(),
    };
  }
}
