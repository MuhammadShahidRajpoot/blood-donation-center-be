import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class PublishDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  subject: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  content: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  is_read = false;

  @IsOptional()
  @ApiProperty()
  operations: []; // This will be used to notify everyone while publishing the schedule
}
