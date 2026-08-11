import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsEnum } from "class-validator";
import { Role } from "generated/prisma/client";
import { Transform } from "class-transformer";

export class CreateUserDto {
    @ApiProperty({ description: 'User name' })
    @IsString()
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @MinLength(3, { message: 'Name must be at least 3 characters' })
    @MaxLength(25, { message: 'Name cannot exceed 25 characters' })
    name: string;

    @ApiProperty({ description: 'User email' })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    email: string;

    @ApiProperty({ description: 'Password' })
    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @ApiPropertyOptional({ description: 'Birthday (ISO string)', example: '2026-08-07' })
    @IsOptional()
    @Transform(({ value }) => {
      if (value === '') return null;
      return new Date(value);
    })
    @IsDate({ message: 'Birthday must be a valid date string' })
    birthday: Date; 

    @ApiPropertyOptional({ description: 'Gender' })
    @IsOptional()
    @IsString()
    gender: string;

    @ApiPropertyOptional({ description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone: string;

    @ApiPropertyOptional({ description: 'Role (USER or ADMIN)', enum: Role })
    @IsOptional()
    @IsEnum(Role, { message: 'Invalid Role (Accepts only USER or ADMIN)' })
    role: Role;

    @ApiPropertyOptional({ description: 'Skills (array of strings)', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skill: string[];

    @ApiPropertyOptional({ description: 'Certifications (array of strings)', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    certification: string[];

    @ApiPropertyOptional({ description: 'Avatar' })
    @IsOptional()
    @IsString()
    avatar: string;
}
