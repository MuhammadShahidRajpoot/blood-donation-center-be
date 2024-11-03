import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallJobsdDto {
  @ApiProperty()
  @IsString()
  call_job_name: string;

  @ApiProperty()
  @IsDateString()
  start_date: Date;

  @ApiProperty()
  @IsDateString()
  end_date: Date;

  @ApiProperty()
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsOptional()
  associated_data?: any[];

  @ApiProperty()
  @IsOptional()
  include_segments?: any[]; // You may need to replace 'any' with the actual type

  @ApiProperty()
  @IsOptional()
  exclude_segments?: any[]; // You may need to replace 'any' with the actual type

  @ApiProperty()
  @IsOptional()
  call_script?: any; // You may need to replace 'any' with the actual type

  @ApiProperty()
  @IsOptional()
  call_flow?: any; // You may need to replace 'any' with the actual type

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ type: () => Boolean })
  is_recurring: boolean;

  @ApiProperty()
  @IsOptional()
  recurring_frequency?: number;

  @ApiProperty()
  @IsOptional()
  recurring_type?: string;

  @ApiProperty()
  @IsOptional()
  reccurence_date?: Date;

  @ApiProperty()
  @IsOptional()
  recurring_days?: string;

  @ApiProperty()
  @IsOptional()
  associated_type?: string;

  @ApiProperty()
  @IsOptional()
  tenant_id?: bigint;
}
