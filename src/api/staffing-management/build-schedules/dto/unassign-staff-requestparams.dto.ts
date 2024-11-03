import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class UnAssignStaffParamDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  staff_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  role_id: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  operation_type: PolymorphicType;
}
