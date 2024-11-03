import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffLeaveDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Staff is required' })
  staff_id: bigint;

  @ApiProperty()
  @IsNotEmpty({ message: 'Begin Date is required' })
  @IsDateString()
  begin_date: Date;

  @ApiProperty()
  @IsNotEmpty({ message: 'End Date is required' })
  @IsDateString()
  end_date: Date;

  @ApiProperty()
  @IsNotEmpty({ message: 'Type is required' })
  type_id: bigint;

  @ApiProperty()
  @IsNotEmpty({ message: 'Hours is required' })
  @IsNumber({}, { message: 'Hours must be a number' })
  hours: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Note is required' })
  @IsString({ message: 'Note must be a string' })
  note: string;
}
