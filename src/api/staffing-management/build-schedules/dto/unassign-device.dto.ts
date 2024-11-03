import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { isNumber } from 'lodash';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class UnassignDeviceParamDto {
  @ApiProperty({ required: false })
  device_assignment_id: number;

  @ApiProperty({ required: false })
  device_assignment_draft_id: number;

  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id: number;
}
