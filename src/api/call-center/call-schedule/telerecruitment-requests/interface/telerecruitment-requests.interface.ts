import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TelerecruitmentRequestsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;

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

  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  drive_status?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  end_date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  start_date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  collection_operation_id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  job_status?: string;

  @IsOptional()
  @ApiProperty()
  ids: string;
}
