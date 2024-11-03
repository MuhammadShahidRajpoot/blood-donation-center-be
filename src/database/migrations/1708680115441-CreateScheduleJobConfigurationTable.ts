import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';
import { ScheduleBaseOnEnum } from '../../api/scheduler/enum/schedule_base_on.enum';

export class CreateScheduleJobConfigurationTable1708680115441
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule_job_configuration',
        columns: [
          ...genericColumns,
          {
            name: 'job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'schedule_base_on',
            type: 'enum',
            enum: Object.values(ScheduleBaseOnEnum),
            isNullable: false,
          },
          {
            name: 'schedule_time',
            type: 'timestamp',
            precision: 6,
            isNullable: true,
          },
          { name: 'is_active', type: 'boolean', default: false },
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );
    await queryRunner.createForeignKey(
      'schedule_job_configuration',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'schedule_job_details',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'schedule_job_configuration',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'schedule_job_configuration',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      })
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('schedule_job_configuration');
  }
}
