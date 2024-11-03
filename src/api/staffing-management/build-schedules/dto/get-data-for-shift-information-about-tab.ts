import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetDataForShiftInformationAboutTab {
  @IsString()
  @ApiProperty()
  operation_id: string;

  @IsString()
  @ApiProperty()
  operation_type: string;

  @IsString()
  @ApiProperty()
  shift_id: string;
}
