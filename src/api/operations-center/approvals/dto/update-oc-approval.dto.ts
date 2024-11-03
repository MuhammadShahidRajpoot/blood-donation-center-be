import {
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatusEnum } from '../enums/oc-approval.enum';
import { FieldApprovalStatusEnum } from '../enums/oc-approval-detail.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApprovalDto {
  @IsOptional()
  @IsEnum(RequestStatusEnum)
  @ApiProperty({
    description: 'Status of the request',
    enum: RequestStatusEnum,
  })
  request_status: RequestStatusEnum;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Flag indicating if discussion is required',
    type: Boolean,
  })
  is_discussion_required: boolean;

  @IsOptional()
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
  @ApiProperty()
  id: number;

  @IsOptional()
  @IsEnum(FieldApprovalStatusEnum)
  @ApiProperty({
    description: 'Status of the field approval',
    enum: FieldApprovalStatusEnum,
  })
  field_approval_status: FieldApprovalStatusEnum;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Flag indicating if override is allowed',
    type: Boolean,
  })
  is_override: boolean;
}
