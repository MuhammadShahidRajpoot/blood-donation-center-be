import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export class GetOperationsOptionalParamDto {
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
  @ApiPropertyOptional({ required: false })
  status?: number;
  @IsOptional()
  @ApiPropertyOptional()
  in_sync?: boolean;
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
  @IsOptional()
  @ApiProperty()
  getAllData?: boolean = false; // If true then no pagination and limiting will apply
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notify?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id: number;
}
