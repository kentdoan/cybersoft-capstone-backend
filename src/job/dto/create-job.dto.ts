import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  job_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  short_description: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  stars?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  category_id: number;
}
