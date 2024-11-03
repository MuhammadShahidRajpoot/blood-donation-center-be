import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class AttachmentsQuery {
  @IsNotEmpty({ message: 'Attachment Id is required' })
  @ApiProperty({
    type: Number,
    description: 'Taskable ID',
    required: false,
  })
  attachmentable_id?: bigint;

  @IsNotEmpty({ message: 'Attachment Type is required' })
  @IsEnum(PolymorphicType)
  @ApiProperty({ required: false, enum: PolymorphicType })
  attachmentable_type: PolymorphicType;
}

export class AttachmentsFiltersInterface extends AttachmentsQuery {
  @IsOptional()
  @ApiProperty({
    description: 'keyword',
    required: false,
  })
  keyword?: string;

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Category ID',
    required: false,
  })
  category_id?: bigint;

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'SubCategory ID',
    required: false,
  })
  sub_category_id?: bigint;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  tenant_id: bigint;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';
}
