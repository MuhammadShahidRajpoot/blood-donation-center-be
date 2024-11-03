import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ReAssignVehicleParamDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  collection_operation_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  date: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id: number;
}
