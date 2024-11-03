import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  MaxLength,
  IsUppercase,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssertionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'Code must not exceed 20 characters' })
  @IsUppercase({ message: 'Code should be in all capital letters' })
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @ApiProperty()
  description: string;

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
  is_active: boolean;

  @ApiProperty()
  @IsBoolean()
  is_archived: boolean;
}
