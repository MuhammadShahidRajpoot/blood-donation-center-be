import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class ManageScriptsDto {
  @ApiProperty({ enum: PolymorphicType })
  @IsNotEmpty()
  script_type: PolymorphicType;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @ApiProperty()
  name: string;

  @IsNotEmpty({ message: 'Script is required' })
  @IsString({ message: 'Script must be a string' })
  @ApiProperty()
  script: string;

  @ApiProperty()
  is_voice_recording: boolean;

  @ApiProperty()
  is_recorded_message: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  attachment_file: string;

  @ApiProperty()
  is_active: boolean;
}
