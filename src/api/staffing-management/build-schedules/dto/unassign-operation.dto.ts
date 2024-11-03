import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class UnassignOperationParamDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  operation_type: PolymorphicType;

  @IsOptional()
  @ApiProperty({ required: false })
  tenant_id: number;
}
