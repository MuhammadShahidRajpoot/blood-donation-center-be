import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateAssignStaffParamDto {
  @IsNotEmpty()
  @ApiProperty({ required: false })
  staff_assignment_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: false })
  staff_draft_assignment_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_shift_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_role_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  schedule_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  operation_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: false, type: 'text' })
  operation_type: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  userId: number;
}
