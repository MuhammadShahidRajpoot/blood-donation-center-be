import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DialingCenterNotesDto {
  @ApiProperty()
  @IsNotEmpty()
  donor_id: bigint;

  @ApiProperty()
  @IsNotEmpty({ message: 'Text is required' })
  @IsString({ message: 'Text must be a string' })
  text: string;
}
