import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

export class TasksQuery {
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Taskable ID',
    required: false,
  })
  taskable_id?: bigint;

  @IsOptional()
  @IsEnum(PolymorphicType)
  @ApiProperty({ required: false, enum: PolymorphicType })
  taskable_type: PolymorphicType;
}

export class GetAllTasksInterface {
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Taskable ID',
    required: false,
  })
  taskable_id?: bigint;

  @IsOptional()
  @IsEnum(PolymorphicType)
  @ApiProperty({ required: false, enum: PolymorphicType })
  taskable_type: PolymorphicType;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsString({ message: 'Task name must be string' })
  @IsOptional()
  @ApiProperty({ required: false })
  task_name: string;

  @IsString({ message: 'Status is not valid.' })
  @IsOptional()
  @ApiProperty({ required: false, enum: [1, 2, 3, 4, 5] })
  status: string;

  @IsString({ message: 'Due Date is not valid.' })
  @IsOptional()
  @ApiProperty({ required: false, enum: [1, 2, 3, 4] })
  due_date: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ['name', 'short_name', 'description', 'status', 'retire_on'],
  })
  sortBy?: string = '';
}
