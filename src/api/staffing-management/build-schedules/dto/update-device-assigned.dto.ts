import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAssignDeviceParamDto {
  @ApiProperty({ required: true })
  device_assignment_id: number;

  @ApiProperty({ required: false })
  device_assignment_draft_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  old_shift_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  requested_device_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  assigned_device_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_shift_id: bigint;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_operation_id: bigint;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_operation_type: string;

  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id: number;
}
