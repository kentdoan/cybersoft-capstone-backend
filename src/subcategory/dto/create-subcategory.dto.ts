import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class DetailSubcategoryDto {
    @ApiProperty({ description: 'Tên của thư mục con chi tiết' })
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class CreateSubcategoryDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    category_id: number;

    @ApiProperty({ type: [DetailSubcategoryDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailSubcategoryDto)
    list_subcategory: DetailSubcategoryDto[];
}
