import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async create(createSkillDto: CreateSkillDto) {
    return this.prisma.skill.create({ data: createSkillDto });
  }

  async findAll() {
    return this.prisma.skill.findMany();
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    return this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });
  }

  async remove(id: number) {
    await this.prisma.skill.delete({ where: { id } });
  }
}
