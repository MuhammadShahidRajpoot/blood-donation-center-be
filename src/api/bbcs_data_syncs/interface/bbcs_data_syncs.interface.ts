import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BBCSDataSyncInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  end_date?: string;
}
