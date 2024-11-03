import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  communication_message_type_enum,
  communication_status_enum,
} from '../enum/communication.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class CreateCommunicationDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'communicationable_id is required' })
  communicationable_id: bigint;

  @ApiProperty()
  @IsEnum(PolymorphicType)
  @IsNotEmpty({ message: 'communicationable_type is required' })
  communicationable_type: PolymorphicType;

  // @ApiProperty()
  // contact_id: bigint;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  @IsEnum(communication_message_type_enum)
  message_type: communication_message_type_enum;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message_text: string;

  @ApiProperty()
  template_id: bigint;

  @ApiProperty()
  @IsEnum(communication_status_enum)
  status: communication_status_enum;

  @ApiHideProperty()
  forbidUnknownValues: true;

  @ApiHideProperty()
  email_body: string;
}
