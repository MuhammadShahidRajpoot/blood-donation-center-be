import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateAssignVehicleParamDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  shift_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  requested_vehicle_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  schedule_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  assigned_vehicle_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_operation_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  updated_operation_type: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  vehicle_assignment_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  userId: number;
}
