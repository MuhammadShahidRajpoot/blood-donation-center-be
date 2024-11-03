import {
  IsNotEmpty,
  IsString,
  IsInt,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export class AgentStandardDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'calls_per_hour is required' })
  @IsInt({ message: 'calls_per_hour must be a number' })
  calls_per_hour: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'appointments_per_hour is required' })
  @IsInt({ message: 'appointments_per_hour must be a number' })
  appointments_per_hour: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'donors_per_hour is required' })
  @IsInt({ message: 'donors_per_hour must be a number' })
  donors_per_hour: number;
}

export class NoAnswerCallTreatmentDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'busy_calls_outcome is required' })
  @IsString({ message: 'busy_calls_outcome must be a string' })
  busy_call_outcome: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'max_retries is required' })
  @IsInt({ message: 'max_retries must be a number' })
  max_retries: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'no_answer_calls_outcome is required' })
  @IsString({ message: 'no_answer_calls_outcome must be a string' })
  no_answer_call_outcome: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'max_no_of_rings is required' })
  @IsInt({ message: 'max_no_of_rings must be a number' })
  max_no_of_rings: number;
}

export class CallSettingDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'caller_id_name is required' })
  @IsString({ message: 'caller_id_name must be a string' })
  caller_id_name: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'caller_id_number is required' })
  @IsString({ message: 'caller_id_number must be a string' })
  caller_id_number: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'callback_number is required' })
  @IsString({ message: 'callback_number must be a string' })
  callback_number: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'max_calls_per_rolling_30_days is required' })
  @IsInt({ message: 'max_calls_per_rolling_30_days must be a number' })
  max_calls_per_rolling_30_days: number;
  @ApiProperty()
  @IsNotEmpty({ message: 'max_calls is required' })
  @IsInt({ message: 'max_calls must be a number' })
  max_calls: number;
}

export class CallCenterSettingsDto {
  @IsOptional()
  @IsInt()
  @ApiProperty()
  id: bigint;
  @ApiProperty({ type: () => [AgentStandardDto] })
  @ValidateNested({ each: true })
  @Type(() => AgentStandardDto)
  agent_standards: AgentStandardDto;

  @ApiProperty({ type: () => [CallSettingDto] })
  @ValidateNested({ each: true })
  @Type(() => CallSettingDto)
  call_settings: CallSettingDto;

  @ApiProperty({ type: () => [NoAnswerCallTreatmentDto] })
  @ValidateNested({ each: true })
  @Type(() => NoAnswerCallTreatmentDto)
  no_answer_call_treatment: NoAnswerCallTreatmentDto;
}
