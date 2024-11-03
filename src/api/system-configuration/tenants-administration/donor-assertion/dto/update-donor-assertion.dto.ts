import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  IsUppercase,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssertionDto {
  @IsString()
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @ApiProperty()
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(20, { message: 'Code must not exceed 20 characters' })
  @ApiProperty()
  @IsUppercase({ message: 'Code should be in all capital letters' })
  @IsOptional()
  code?: string;

  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @ApiProperty()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  is_expired?: boolean;

  @IsInt()
  @ApiProperty()
  @IsOptional()
  expiration_months?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
}
