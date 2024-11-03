import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetAllDrivesFilterInterface {
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
  @ApiProperty()
  keyword: string;

  @IsOptional()
  fetch_all: boolean;

  @IsOptional()
  is_linked: boolean;

  @IsOptional()
  is_linkable: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  childSortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';

  @IsOptional()
  @ApiProperty()
  endDate: string;

  @IsOptional()
  @ApiProperty()
  startDate: string;

  @IsOptional()
  @ApiProperty()
  account?: bigint;

  @IsOptional()
  @ApiProperty()
  organizational_levels: string;

  @IsOptional()
  @ApiProperty()
  location?: bigint;

  @IsOptional()
  @ApiProperty()
  min_projection?: bigint;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  exportType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  downloadType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  selectedOptions?: string;

  @IsOptional()
  @ApiProperty()
  max_projection?: bigint;

  @IsOptional()
  @ApiProperty()
  promotion?: string;

  @IsOptional()
  @ApiProperty()
  status?: string;

  @IsOptional()
  @ApiProperty()
  day: string;

  @IsOptional()
  @ApiProperty()
  shiftStart: string;

  @IsOptional()
  @ApiProperty()
  shiftEnd: string;

  @IsOptional()
  @ApiProperty()
  is_active: string;

  @IsOptional()
  @ApiProperty()
  ids: string;
}
export class GetAllPickupsInterface {
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
  type?: string;
}
