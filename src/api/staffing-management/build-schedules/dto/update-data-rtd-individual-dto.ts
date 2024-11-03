import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateDataRtdIndividualDto {
  @IsNumber()
  @ApiProperty()
  staff_assignment_id: number;

  @IsNumber()
  @ApiProperty()
  staff_assignment_draft_id: number;

  @IsNumber()
  @ApiProperty()
  shift_id: number;

  @IsNumber()
  @ApiProperty()
  lead_time: number;

  @IsNumber()
  @ApiProperty()
  travel_to_time: number;

  @IsNumber()
  @ApiProperty()
  setup_time: number;

  @IsNumber()
  @ApiProperty()
  breakdown_time: number;

  @IsNumber()
  @ApiProperty()
  travel_from_time: number;

  @IsNumber()
  @ApiProperty()
  wrapup_time: number;

  @IsNumber()
  @ApiProperty()
  total_hours: number;

  @IsString()
  @ApiProperty()
  shift_start_time: string;

  @IsString()
  @ApiProperty()
  shift_end_time: string;

  @IsString()
  @ApiProperty()
  clock_in_time: string;

  @IsString()
  @ApiProperty()
  clock_out_time: string;
}
