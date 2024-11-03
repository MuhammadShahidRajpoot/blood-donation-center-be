import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentSubCategoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Note Category name is required' })
  @IsString({ message: 'Note Category name must be a string' })
  name: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Is active is required' })
  @IsBoolean({ message: 'is_active must be a boolean value' })
  is_active: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'Parent id is required' })
  @IsInt({ message: 'Parent id must be a bigint value' })
  parent_id: bigint;
}
