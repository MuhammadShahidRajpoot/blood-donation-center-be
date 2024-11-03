import { IsInt, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperationTypeEnum } from '../enums/operation-type.enum';

export class CallJobsAssociatedOperationDto {
  @ApiProperty()
  @IsNotEmpty()
  call_job_id: bigint;

  @ApiProperty()
  @IsInt()
  operationable_id: number;

  @ApiProperty()
  @IsEnum(OperationTypeEnum)
  operationable_type: string;
}
