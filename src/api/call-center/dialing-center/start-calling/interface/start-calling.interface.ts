import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class StartCallingInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  call_sid?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  parent_call_sid?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  call_status?: string;
}
