import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class CallFlowsQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;

  @IsString({ message: 'Status must be a true or false' })
  @IsOptional()
  @ApiProperty({ required: false, enum: ['true, false'] })
  status = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ['name', 'last_update', 'status'],
  })
  sortBy?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @ApiProperty({ required: false })
  name?: string = '';
}
