import {
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatusEnum, RequestTypeEnum } from '../enums/oc-approval.enum';
import {
  FieldApprovalStatusEnum,
  FieldEnum,
} from '../enums/oc-approval-detail.enum';
import { ApiProperty } from '@nestjs/swagger';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class CreateApprovalDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'ID of the operation',
    type: Number,
  })
  operationable_id: bigint;

  @IsNotEmpty()
  @IsEnum(PolymorphicType)
  @ApiProperty({
    description: 'Type of operation',
    enum: PolymorphicType,
  })
  operationable_type: PolymorphicType;

  @IsNotEmpty()
  @IsEnum(RequestTypeEnum)
  @ApiProperty({
    description: 'Type of request',
    enum: RequestTypeEnum,
  })
  request_type: RequestTypeEnum;

  @IsNotEmpty()
  @IsEnum(RequestStatusEnum)
  @ApiProperty({
    description: 'Status of the request',
    enum: RequestStatusEnum,
  })
  request_status: RequestStatusEnum;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Flag indicating if discussion is required',
    type: Boolean,
  })
  is_discussion_required: boolean;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailDTO)
  @ApiProperty({
    description: 'Array of details for the request',
  })
  details: DetailDTO[];
}

export class DetailDTO {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'ID of the shift',
    type: Number,
  })
  shift_id: number;

  @IsNotEmpty()
  @IsEnum(FieldEnum)
  @ApiProperty({
    description: 'Type of field',
    enum: FieldEnum,
  })
  field: FieldEnum;

  @IsNotEmpty()
  @IsEnum(FieldApprovalStatusEnum)
  @ApiProperty({
    description: 'Status of the field approval',
    enum: FieldApprovalStatusEnum,
  })
  field_approval_status: FieldApprovalStatusEnum;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Flag indicating if override is allowed',
    type: Boolean,
  })
  is_override: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Original value of the field',
    type: Object,
  })
  original: any;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Requested value of the field',
    type: Object,
  })
  requested: any;
}
