import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CloseDateInterface {
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
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  closed_dates: string;

  @IsOptional()
  @ApiProperty()
  collection_operation: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  collection_operation_sort?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string = '';
}

export class DateClosedInterface {
  @IsString({ message: 'Collection Operation is required' })
  @IsNotEmpty({ message: 'Collection Operation is required' })
  @ApiProperty()
  collection_operation_id: bigint;

  @IsString({ message: 'Date is required' })
  @IsNotEmpty({ message: 'Date is required' })
  @ApiProperty()
  date: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  end_date?: Date;
}
