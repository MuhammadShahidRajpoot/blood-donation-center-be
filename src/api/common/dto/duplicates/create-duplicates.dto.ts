import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDuplicateDto {
  @ApiProperty({ type: 'number' })
  @IsNotEmpty({ message: 'Record is required' })
  record_id: bigint;

  @ApiPropertyOptional({ type: 'boolean', default: false })
  @IsBoolean({ message: 'Resolved should be a boolean' })
  @IsOptional()
  is_resolved: boolean;
}

export class CreateManyDuplicateDto {
  @ApiProperty({ type: 'number' })
  @IsNotEmpty({ message: 'Record is required' })
  record_id: number;

  @ApiProperty({ type: [Number] })
  @IsNotEmpty({ message: 'Record is required' })
  @IsArray()
  duplicatable_ids: number[];

  @ApiPropertyOptional({ type: 'boolean', default: false })
  @IsBoolean({ message: 'Resolved should be a boolean' })
  @IsOptional()
  is_resolved: boolean;
}
