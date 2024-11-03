import { IsNotEmpty, IsInt, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class EditDonationsSummeryDTO {
  @IsNotEmpty({ message: 'Appointments should not be empty' })
  @IsInt({ message: 'Appointments must be an integer number' })
  @ApiProperty()
  appointments: number;

  @IsNotEmpty({ message: 'Projection should not be empty' })
  @IsInt({ message: 'Projection must be an integer number' })
  @ApiProperty()
  projection: number;

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
}
