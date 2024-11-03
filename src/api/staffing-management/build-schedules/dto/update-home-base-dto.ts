import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateHomeBaseDto {
  @IsNumber()
  @ApiProperty()
  staff_assignment_id: number;

  @IsNumber()
  @ApiProperty()
  staff_assignment_draft_id: number;

  @IsNumber()
  @ApiProperty()
  home_base_enum: number;

  @IsBoolean()
  @ApiProperty()
  is_travel_time_included: number;

  @IsNumber()
  @ApiProperty()
  minutes: number;
}
