import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PaginationDto {
    @ApiPropertyOptional({example: 1, description: "Số trang hiện tại"})
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    pageIndex?: number;

    @ApiPropertyOptional({example: 10, description: "Số lượng item trên mỗi trang"})
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    pageSize?: number;
    
    @ApiPropertyOptional({example: "Graphics", description: "Từ khóa tìm kiếm"})
    @IsString()
    @IsOptional()
    keyword?: string;
}
