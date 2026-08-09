import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateRentJobDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  job_id: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  finish?: boolean;
}
