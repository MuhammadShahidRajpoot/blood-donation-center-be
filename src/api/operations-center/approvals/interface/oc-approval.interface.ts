import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatusEnum, RequestTypeEnum } from '../enums/oc-approval.enum';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class GetOcApprovalsInterface {
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  request_date?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  operation_date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizational_levels?: string;

  @IsOptional()
  @IsEnum(RequestTypeEnum)
  @ApiProperty({ required: false, enum: RequestTypeEnum })
  request_type: RequestTypeEnum;

  @IsOptional()
  @IsEnum(PolymorphicType)
  @ApiProperty({ required: false, enum: PolymorphicType })
  operation_type: PolymorphicType;

  @IsOptional()
  @ApiProperty({ required: false })
  requestor?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  manager?: number;

  @IsOptional()
  @IsEnum(RequestStatusEnum)
  @ApiProperty({ required: false, enum: RequestStatusEnum })
  request_status: RequestStatusEnum;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsOptional()
  @ApiProperty({
    description: 'keyword',
    required: false,
  })
  keyword?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  sortBy?: string = '';
}
