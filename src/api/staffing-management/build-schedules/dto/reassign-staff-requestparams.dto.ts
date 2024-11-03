import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReAssignStaffParamDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  collection_operation_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  date: Date;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  staff_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  operation_status: number[];

  @IsNotEmpty()
  @ApiProperty({ required: true })
  role_id: number;
}
