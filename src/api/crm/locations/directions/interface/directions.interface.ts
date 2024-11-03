import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAllDirectionsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  keyword?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortOrder?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: true })
  location_id?: bigint;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  is_active: boolean;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'Collection Operation',
    required: false,
  })
  collection_operation_id?: Array<bigint>;
}

export class GetDirectionCollectionOperationInterface {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  location_id?: bigint;
}
