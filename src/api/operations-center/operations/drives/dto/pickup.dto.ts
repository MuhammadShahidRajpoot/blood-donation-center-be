import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsDate } from 'class-validator';

enum typeEnum {
  'DRIVE' = 'DRIVE',
  'SESSION' = 'SESSION',
}

export class PickupDto {
  @IsString()
  @ApiProperty()
  description: string;

  @IsNotEmpty({ message: 'Pickable Id value is required' })
  @IsInt({ message: 'Pickable Id must be an integer number' })
  @ApiProperty()
  pickable_id: bigint;

  @IsNotEmpty({ message: 'Equipment Id value is required' })
  @IsInt({ message: 'Equipment Id must be an integer number' })
  @ApiProperty()
  equipment_id: bigint;

  @IsNotEmpty({ message: 'Pickable type value is required' })
  @IsString({ message: 'Pickable type must be a enum stringr' })
  @ApiProperty()
  pickable_type: typeEnum;

  @IsNotEmpty({ message: 'Pickup Start time should not be empty' })
  @ApiProperty()
  start_time: Date;

  @ApiHideProperty()
  forbidUnknownValues: true;
}
