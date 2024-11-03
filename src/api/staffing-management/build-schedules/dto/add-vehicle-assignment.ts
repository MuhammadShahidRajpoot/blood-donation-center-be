import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';

export class AddVehicleAssignmentParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  assigned_vehicle_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  operation_type: string;

  @ApiProperty()
  @IsNotEmpty()
  is_additional: boolean;

  @ApiProperty()
  @IsNotEmpty()
  is_published: boolean;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  reassign_by: number;

  @ApiProperty()
  operation_id: number;

  @ApiProperty()
  shift_id: number;

  @ApiProperty()
  created_by: User;

  @ApiProperty()
  pending_assignment: boolean;

  @ApiProperty()
  vehicle_assignment_id: number;

  @ApiProperty()
  requested_vehicle_type_id: number;

  @ApiProperty()
  tenant_id: number;
}
