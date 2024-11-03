import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsArray } from 'class-validator';

export class NotifyStaffDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  subject: string; // subject of notification

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  content: string; // content of notification

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  schedule_id: string; // ScheduleID which is puslibhed

  @IsNotEmpty()
  @IsArray()
  @ApiProperty()
  operations: any; // List having operation_id, operation_type> for which we need to send notifications
}
