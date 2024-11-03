import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsBoolean,
//   IsDate,
//   IsEnum,
//   IsInt,
//   IsNotEmpty,
//   IsNumber,
// } from 'class-validator';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { timestamp } from 'aws-sdk/clients/cloudfront';

export class CreateStaffAssignmentDto {
  //@IsNotEmpty({ message: 'Staff Id is required.' })
  //@IsInt()
  @ApiProperty()
  staff_id: bigint;

  //@IsNotEmpty({ message: 'Role Id is required.' })
  //@IsInt()
  @ApiProperty()
  role_id: bigint;

  //We get the operation_id and shift_id from the query params, hence why the IsNotEmpty() is omitted
  //@IsInt()
  @ApiProperty()
  operation_id: bigint;

  //@IsInt()
  @ApiProperty()
  shift_id: bigint;

  @ApiProperty()
  shift_start_time: timestamp;

  @ApiProperty()
  shift_end_time: timestamp;

  @ApiProperty({
    description: 'Type of operation',
    enum: PolymorphicType,
  })
  operation_type: PolymorphicType;

  //@IsNotEmpty({ message: 'Home Base Type is required.' })
  //@IsEnum(HomeBaseEnum)
  //@IsEnum(HomeBaseEnum)
  @ApiProperty()
  home_base: number;

  //@IsNotEmpty({ message: 'Lead Time is required.' })
  //@IsNumber()
  @ApiProperty()
  lead_time: number;

  //@IsNotEmpty({ message: 'Travel to Time is required.' })
  //@IsNumber()
  @ApiProperty()
  travel_to_time: number;

  //@IsNotEmpty({ message: 'Setup Time is required.' })
  //@IsNumber()
  @ApiProperty()
  setup_time: number;

  //@IsNotEmpty({ message: 'Breakdown Time is required.' })
  //@IsNumber()
  @ApiProperty()
  breakdown_time: number;

  //@IsNotEmpty({ message: 'Travel from Time is required.' })
  //@IsNumber()
  @ApiProperty()
  travel_from_time: number;

  //@IsNotEmpty({ message: 'Wrapup Time is required.' })
  //@IsNumber()
  @ApiProperty()
  wrapup_time: number;

  //@IsNotEmpty({ message: 'Clock in Time is required.' })
  //@IsDate()
  @ApiProperty()
  clock_in_time: any;

  //@IsNotEmpty({ message: 'Clock out Time is required.' })
  //@IsDate()
  @ApiProperty()
  clock_out_time: any;

  //@IsNotEmpty({ message: 'Total Hours is required.' })
  //@IsNumber()
  @ApiProperty()
  total_hours: number;

  //@IsNotEmpty({ message: 'Is Additional is required.' })
  //@IsBoolean()
  @ApiProperty()
  is_additional: boolean;

  //@IsBoolean()
  @ApiProperty()
  is_travel_time_included: boolean;

  //@IsBoolean()
  @ApiProperty()
  is_published: boolean;

  //@IsNotEmpty({ message: 'Role Id is required.' })
  //@IsInt()
  @ApiProperty()
  tenant_id: number;

  //@IsNotEmpty()
  //@IsInt()
  @ApiProperty()
  created_by: User;

  //@IsBoolean()
  @ApiProperty()
  pending_assignment: boolean;
  //Reason not mentioned in docs as the staff_assignments_drafts were missed
  reason: string;
}
