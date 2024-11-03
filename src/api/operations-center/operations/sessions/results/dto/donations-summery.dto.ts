import { IsNotEmpty, IsInt, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { timestamp } from 'aws-sdk/clients/cloudfront';

export class DonationsSummeryDTO {
  @IsOptional()
  @IsInt()
  @ApiProperty()
  id: bigint;

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

  // @IsNotEmpty({ message: 'Operationable Type should not be empty' })
  // @IsInt({ message: 'Operationable Type must be an integer number' })
  // @ApiProperty()
  // operationable_type: number;

  @IsNotEmpty({ message: 'Appointments should not be empty' })
  @IsInt({ message: 'Appointments must be an integer number' })
  @ApiProperty()
  appointments: number;

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
  walk_out: number;

  created_at: timestamp;
  created_by: bigint;
}
