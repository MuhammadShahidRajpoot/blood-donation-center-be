import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Moment } from 'moment';

export class GetAllMonthlyGoalsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  childSortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  year?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  procedureType?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizational_levels?: string;
}

export class getRecruitersAndDonorCenetrs {
  @ApiProperty({ required: false })
  collectionOperation?: bigint;

  @ApiProperty({ required: false })
  procedure_type?: bigint;

  @ApiProperty({ required: false })
  year?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id?: any;
}

export class ClosedDateInterface {
  start: Moment;
  end: Moment;
}
