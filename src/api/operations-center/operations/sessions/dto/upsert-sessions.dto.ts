import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { refTypeEnum } from '../enums/ref-type.enum';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { CustomFieldsSessionsDto } from './create-custom-fields.dto';
import { ShiftsDto } from 'src/api/shifts/dto/shifts.dto';
import { ResourceSharingDto } from '../../drives/dto/create-drive.dto';

export class UpsertSessionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Session date should not be empty' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  promotion_ids?: string[];

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty({ message: 'Donor Center should not be empty' })
  donor_center_id: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty({ message: 'Collection Operation should not be empty' })
  collection_operation_id: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty({ message: 'Status should not be empty' })
  status_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  custom_fields?: CustomFieldsSessionsDto;

  @ApiProperty({ type: [ShiftsDto] })
  @IsArray()
  shifts: ShiftsDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  remove_shifts?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  slots?: object;

  @ApiPropertyOptional({ type: () => ResourceSharingDto })
  @IsOptional()
  resource_sharing?: ResourceSharingDto[];

  @ApiPropertyOptional()
  @IsOptional()
  ref_id?: number;

  @ApiPropertyOptional({ enum: refTypeEnum })
  @IsEnum(refTypeEnum)
  @IsOptional()
  ref_type?: refTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  override?: boolean;
}
