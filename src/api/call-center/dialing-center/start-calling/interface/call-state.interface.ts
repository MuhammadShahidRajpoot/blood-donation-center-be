import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CallStateInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  CallSid: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  CallStatus?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  CallDuration?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  Duration?: string;
}
