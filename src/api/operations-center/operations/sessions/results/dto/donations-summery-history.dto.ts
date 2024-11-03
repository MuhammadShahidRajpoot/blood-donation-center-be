import {
  IsNotEmpty,
  IsInt,
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DonationsSummeryHistoryDTO {
  @IsOptional()
  @IsInt()
  @ApiProperty()
  rowkey: bigint;

  @IsNotEmpty({ message: 'History Reason should not be empty' })
  @IsString({ message: 'History Reason must be a string' })
  @ApiProperty()
  history_reason: string;

  @IsNotEmpty({ message: 'ID should not be empty' })
  @IsInt({ message: 'ID must be an integer number' })
  @ApiProperty()
  id: bigint;

  @IsNotEmpty({ message: 'Shift ID should not be empty' })
  @IsInt({ message: 'Shift ID must be an integer number' })
  @ApiProperty()
  shift_id: bigint;

  @IsNotEmpty({ message: 'Procedure Type ID should not be empty' })
  @IsInt({ message: 'Procedure Type ID must be an integer number' })
  @ApiProperty()
  procedure_type_id: number;

  @IsNotEmpty({ message: 'Procedure Type Quantity should not be empty' })
  @IsInt({ message: 'Procedure Type Quantity must be an integer number' })
  @ApiProperty()
  procedure_type_qty: number;

  @IsNotEmpty({ message: 'Operation Date should not be empty' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  @IsDate({ message: 'Operation Date must be a valid date' })
  @ApiProperty({
    type: String,
    format: 'date',
    example: '2023-08-01',
  })
  operation_date: Date;

  @IsNotEmpty({ message: 'Operation ID should not be empty' })
  @IsInt({ message: 'Operation ID must be an integer number' })
  @ApiProperty()
  operation_id: number;

  @IsNotEmpty({ message: 'Operationable Type should not be empty' })
  @IsInt({ message: 'Operationable Type must be an integer number' })
  @ApiProperty()
  operationable_type: number;

  @IsNotEmpty({ message: 'Total Appointments should not be empty' })
  @IsInt({ message: 'Total Appointments must be an integer number' })
  @ApiProperty()
  total_appointments: number;

  @IsNotEmpty({ message: 'Registered should not be empty' })
  @IsInt({ message: 'Registered must be an integer number' })
  @ApiProperty()
  registered: number;

  @IsNotEmpty({ message: 'Performed should not be empty' })
  @IsInt({ message: 'Performed must be an integer number' })
  @ApiProperty()
  performed: number;

  @IsNotEmpty({ message: 'Actual should not be empty' })
  @IsInt({ message: 'Actual must be an integer number' })
  @ApiProperty()
  actual: number;

  @IsNotEmpty({ message: 'Deferrals should not be empty' })
  @IsInt({ message: 'Deferrals must be an integer number' })
  @ApiProperty()
  deferrals: number;

  @IsNotEmpty({ message: 'QNS should not be empty' })
  @IsInt({ message: 'QNS must be an integer number' })
  @ApiProperty()
  qns: number;

  @IsNotEmpty({ message: 'FTD should not be empty' })
  @IsInt({ message: 'FTD must be an integer number' })
  @ApiProperty()
  ftd: number;

  @IsNotEmpty({ message: 'Walkout should not be empty' })
  @IsInt({ message: 'Walkout must be an integer number' })
  @ApiProperty()
  walkout: number;

  @IsNotEmpty({ message: 'Created At should not be empty' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  @IsDate({ message: 'Created At must be a valid date' })
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2023-08-01T12:00:00Z',
  })
  created_at: Date;

  @IsInt({ message: 'Created By must be an integer number' })
  @IsOptional()
  @ApiProperty()
  created_by: bigint | null;
}
