import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';

export class AddDeviceAssignmentParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  assigned_device_id: number;

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
  device_assignment_id: number;

  @ApiProperty()
  requested_device_type_id: number;

  @ApiProperty()
  tenant_id: number;
}
