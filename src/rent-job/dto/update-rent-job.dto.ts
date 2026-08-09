import { PartialType } from '@nestjs/swagger';
import { CreateRentJobDto } from './create-rent-job.dto';

export class UpdateRentJobDto extends PartialType(CreateRentJobDto) {}
