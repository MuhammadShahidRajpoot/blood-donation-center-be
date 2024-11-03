import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiHideProperty, ApiProperty, PartialType } from '@nestjs/swagger';
import { ColorCodeEnum } from '../enums/call-outcomes.enum';

export class CreateCallOutcomeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Call Outcome name is required' })
  @IsString({ message: 'Call Outcome name must be a string' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Call Outcome code is required' })
  @IsString({ message: 'Call Outcome code must be a string' })
  code: string;

  @ApiProperty({
    description: 'Color',
    isArray: true,
    enum: ColorCodeEnum,
  })
  @IsEnum(ColorCodeEnum, { each: true })
  color: ColorCodeEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt({ message: 'Next Call Interval must be a number value' })
  next_call_interval: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean({ message: 'Is Active must be a boolean value' })
  is_active: boolean;

  @ApiProperty({ default: false })
  is_archived: boolean;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  created_by: bigint;
}

export class GetAllCallOutcomesDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ['name', 'code', 'is_active', 'color', 'next_call_interval'],
  })
  sortBy?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @ApiProperty()
  keyword?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;

  @IsString({ message: 'Status must be boolean' })
  @IsOptional()
  @ApiProperty({ required: false, enum: ['true, false'] })
  is_active: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll?: boolean;
}
