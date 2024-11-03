import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class FacilityInterface {}

export class GetFacilityInterface {
  @ApiProperty({ required: true })
  @IsString()
  id: any;
}

export class GetDonorCenterStagingSitesInterface {
  @ApiPropertyOptional({ enum: PolymorphicType })
  @IsEnum(PolymorphicType)
  @IsOptional()
  type?: PolymorphicType;

  @ApiProperty({ required: true })
  @IsString()
  collection_operation: bigint;

  @ApiProperty({ required: true })
  @IsString()
  drive_date: string;

  @ApiProperty({ required: false })
  keyword: string;
}
