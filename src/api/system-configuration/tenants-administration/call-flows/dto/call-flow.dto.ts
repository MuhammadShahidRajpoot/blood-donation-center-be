import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { callFlows } from '../enums/callFlows.enum';
export class callFlowDto {
  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty()
  is_default: boolean;

  @ApiProperty({ enum: callFlows })
  @IsNotEmpty()
  caller_answer_call: callFlows;

  @ApiProperty({ enum: callFlows })
  @IsNotEmpty()
  vmbox_detected: callFlows;

  @ApiProperty({ default: true })
  is_active: boolean;

  @ApiProperty({ default: false })
  is_archived: boolean;
}
