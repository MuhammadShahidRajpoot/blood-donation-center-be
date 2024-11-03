import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavoriteLocationTypeEnum } from '../../manage-favorites/enum/manage-favorites.enum';

export class CreateProspectDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description: string;

  @IsArray()
  @ApiProperty()
  blueprints_ids: bigint[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  message: string;

  @ApiProperty({ required: false })
  schedule_date: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  template_id?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  status: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  start_date: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  end_date: string;

  @IsOptional()
  @ApiProperty({ required: false })
  min_projection?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  max_projection?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  eligibility: number;

  @IsOptional()
  @ApiProperty({ required: false })
  distance: number;

  @IsOptional()
  @ApiProperty({ required: false })
  organizational_level_id: number[];

  @IsOptional()
  @IsEnum(FavoriteLocationTypeEnum)
  @ApiProperty({ required: false, enum: FavoriteLocationTypeEnum })
  location_type: FavoriteLocationTypeEnum;
}

export class UpdateProspectDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  status: boolean;
}

export class ListProspectsDto {
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
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  status?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  getByIds?: bigint[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  start_date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  end_date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  min_projection?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  max_projection?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  eligibility?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  distance?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  location_type?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  organizational_levels?: string;
}

export class GetAllProspects {
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
  fetchAll?: string | boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  start_date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  end_date?: string;
}
