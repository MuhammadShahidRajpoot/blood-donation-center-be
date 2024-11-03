import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetSchedulesOptionalParamDto {
  @IsOptional()
  @ApiProperty({ required: false })
  page: number;

  @IsOptional()
  @ApiProperty({ required: false })
  limit: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  keyword?: string;

  @IsOptional()
  @ApiPropertyOptional()
  flagged?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ['Draft', 'Published'] })
  status?: string;

  @IsOptional()
  @ApiPropertyOptional()
  collectionOperation?: number[];

  @IsOptional()
  @ApiPropertyOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';
}
