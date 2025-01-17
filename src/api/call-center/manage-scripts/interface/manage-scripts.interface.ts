import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class GetAllCallScriptsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['name', 'description', 'is_active'] })
  sortName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  is_active: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  hasVM: boolean;

  @ApiProperty({ enum: PolymorphicType })
  @IsOptional()
  script_type: [PolymorphicType];
}
