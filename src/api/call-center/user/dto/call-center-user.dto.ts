import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallCenterUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'User id is required' })
  user_id: bigint;

  @ApiProperty()
  @IsBoolean()
  is_lead: boolean;
}
