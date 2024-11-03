import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GetAllAccountAffiliationsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  is_current?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false })
  co_id?: number;
}
