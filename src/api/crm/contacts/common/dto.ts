import { ApiProperty } from '@nestjs/swagger';
import {
  CommunicationMessageTypeEnum,
  CommunicationStatusEnum,
  ContactTypeEnum,
} from './enums';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class ContactDto {
  id: bigint;
  @ApiProperty()
  contactable_id: bigint;

  @IsNotEmpty({ message: 'contactable Type is required' })
  @IsEnum(PolymorphicType)
  @ApiProperty({ enum: PolymorphicType })
  contactable_type: PolymorphicType;

  @IsNotEmpty({ message: 'Contact Type is required' })
  @IsEnum(ContactTypeEnum)
  @ApiProperty({ enum: ContactTypeEnum })
  contact_type: ContactTypeEnum;

  @ApiProperty()
  data: string; //This will have Email or Phone number
  @ApiProperty()
  is_primary: boolean;
  @ApiProperty({ default: false })
  is_archived: boolean;
  @ApiProperty()
  created_at: Date;
  @ApiProperty()
  created_by: bigint;
}

export class CommunicationDto {
  id: bigint;
  communicationable_id: bigint;
  communicationable_type: PolymorphicType;
  contact_id: bigint;
  date: Date;
  message_type: CommunicationMessageTypeEnum;
  subject: string;
  message_text: string;
  template_id: bigint;
  status: CommunicationStatusEnum;
  status_detai: string;
  is_archived: boolean;
  created_at: Date;
  created_by: number;
}

export class ContactPreferenceDto {
  id: bigint;
  contact_preferenceable_id: bigint;
  contact_preferenceable_type: PolymorphicType;
  is_optout_email: boolean;
  is_optout_sms: boolean;
  is_optout_push: boolean;
  is_optout_call: boolean;
  next_call_date: Date;
  is_archived: boolean;
  created_at: Date;
  created_by: number;
}

export class AddressDto {
  id: bigint; // if id is zero or null, it's a new address and otherwise it's an existing address

  @ApiProperty()
  addressable_id: bigint; //Required feild

  @IsNotEmpty({ message: 'Addressable Type is required' })
  @IsEnum(PolymorphicType)
  @ApiProperty({ enum: PolymorphicType })
  addressable_type: PolymorphicType;

  @IsOptional()
  @IsString({ message: 'Address one must be a string' })
  @ApiProperty()
  address1: string; //Required feild

  @IsOptional()
  @IsString({ message: 'Address two must be a string' })
  @ApiProperty()
  address2: string; //Optional feild

  @IsOptional()
  @IsString({ message: 'Zip code must be a String' })
  @ApiProperty()
  zip_code: string; //Optional feild

  @IsOptional()
  @IsString({ message: 'City must be a String' })
  @ApiProperty()
  city: string; //Optional feild

  @IsOptional()
  @IsString({ message: 'State must be a String' })
  @ApiProperty()
  state: string; //Optional feild

  @IsOptional()
  @IsString({ message: 'Country must be a String' })
  @ApiProperty()
  country: string; //Optional feild

  @IsOptional()
  @IsString({ message: 'County must be a String' })
  @ApiProperty()
  county: string; //Optional feild

  @ApiProperty()
  latitude: number; //Optional feild

  @ApiProperty()
  longitude: number; //Optional feild

  @IsOptional()
  @IsString({ message: 'Short State must be a String' })
  @ApiProperty()
  short_state: string;

  @ApiProperty({ default: false })
  is_archive: boolean; //Optional feild

  @ApiProperty()
  created_at: Date; //Required feild

  @ApiProperty()
  created_by: bigint; //Required feild

  @ApiProperty()
  coordinates: string;

  @ApiProperty()
  tenant_id: bigint;
}
