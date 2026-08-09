import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterAuthDto {
    @ApiProperty({ description: 'Tên người dùng' })
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
    @MaxLength(25, { message: 'Tên không được vượt quá 25 ký tự' })
    name: string;

    @ApiProperty({ description: 'Email người dùng' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({ description: 'Mật khẩu' })
    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @ApiPropertyOptional({ description: 'Số điện thoại' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'Ngày sinh (chuỗi ISO)', example: '2026-08-07T17:20:14.930Z' })
    @IsOptional()
    @Transform(({ value }) => value === '' ? null : value)
    @IsDateString()
    birthday?: string; 

    @ApiPropertyOptional({ description: 'Giới tính' })
    @IsOptional()
    @IsString()
    gender?: string;
}
