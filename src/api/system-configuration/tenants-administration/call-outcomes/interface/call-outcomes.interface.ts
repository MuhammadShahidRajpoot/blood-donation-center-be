import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ColorCodeEnum } from '../enums/call-outcomes.enum';

export class GetAllCallOutcomesInterface {
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
  @ApiProperty({ required: false })
  status: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  code: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false })
  next_call_interval: number;

  @IsEnum(ColorCodeEnum, { each: true })
  @ApiProperty({
    description: 'Color',
    isArray: true,
    enum: ColorCodeEnum,
  })
  color: ColorCodeEnum;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ['name', 'code', 'color', 'next_call_interval', 'status'],
  })
  sortBy?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';
}
