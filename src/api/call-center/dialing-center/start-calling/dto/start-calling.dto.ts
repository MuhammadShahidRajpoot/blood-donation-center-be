import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class StartCallingDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Donor phone number is required' })
  donor_phone_number = '';

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Max number of rings is required' })
  max_rings = '';

  @ApiProperty({ required: false })
  playVoiceMessage: boolean;
}

export class updateCallDto {
  @ApiProperty({ required: false })
  voice_message_url = '';

  @ApiProperty({ required: false })
  child_call_sid = '';
}
