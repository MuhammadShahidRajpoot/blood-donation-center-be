import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import genericColumns from '../common/generic-columns';

export class CreateCallJobsAgentsTable1707225260695
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_agents',
        columns: [
          ...genericColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'staff_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'assigned_calls',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_calling',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'call_jobs_agents',
      new TableForeignKey({
        columnNames: ['staff_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'staff',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs_agents',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('call_jobs_agents', 'FK_staff_id');

    await queryRunner.dropForeignKey('call_jobs_agents', 'FK_created_by');

    await queryRunner.dropTable('call_jobs_agents');
  }
}
