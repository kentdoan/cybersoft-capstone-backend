import { PartialType } from '@nestjs/swagger';
import { CreateSubcategoryDto, DetailSubcategoryDto } from './create-subcategory.dto';

export class UpdateDetailSubcategoryDto extends PartialType(DetailSubcategoryDto){
    
}

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}
