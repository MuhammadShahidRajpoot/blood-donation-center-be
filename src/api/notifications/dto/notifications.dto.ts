import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationsDto {
  @ApiProperty({ description: 'Title of the notification' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Content of the notification' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Organizational levels targeted by the notification',
  })
  @IsArray()
  organizational_level: bigint[];

  @ApiProperty({
    description: 'Modules targeted by the notification',
  })
  @IsArray()
  module: bigint[];

  @ApiProperty({
    description: 'Actionable link associated with the notification',
  })
  @IsString()
  actionable_link: string;

  @ApiProperty()
  @IsOptional()
  user_id?: bigint;

  @ApiProperty()
  @IsOptional()
  target_type_id?: bigint;

  @ApiProperty()
  @IsOptional()
  target_type?: string;
}
