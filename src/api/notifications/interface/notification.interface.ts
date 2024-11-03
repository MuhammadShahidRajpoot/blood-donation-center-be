import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NotificationsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sort_by?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sort_order?: string;
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  isRead?: string;
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  start_date?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  end_date?: string = '';

  @IsOptional()
  @ApiProperty({ required: false })
  pushNotificationId?: number;
}
