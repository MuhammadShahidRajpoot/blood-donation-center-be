import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class GetRtdDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  shift_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  schedule_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  operation_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  operation_type: string;
}
