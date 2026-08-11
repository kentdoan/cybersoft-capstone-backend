import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PaginationDto {
    @ApiPropertyOptional({example: 1, description: "Current page number"})
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    pageIndex?: number;

    @ApiPropertyOptional({example: 10, description: "Number of items per page"})
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    pageSize?: number;
    
    @ApiPropertyOptional({example: "Graphics", description: "Search keyword"})
    @IsString()
    @IsOptional()
    keyword?: string;
}
