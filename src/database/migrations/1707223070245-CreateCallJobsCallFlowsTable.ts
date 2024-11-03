import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import genericColumns from '../common/generic-columns';

export class CreateCallJobsCallFlowsTable1707223070245
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_call_flows',
        columns: [
          ...genericColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'call_flow_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'call_jobs_call_flows',
      new TableForeignKey({
        columnNames: ['call_flow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_flows',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs_call_flows',
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
    await queryRunner.dropForeignKey('call_jobs_call_flows', 'FK_call_flow_id');

    await queryRunner.dropForeignKey('call_jobs_call_flows', 'FK_created_by');

    await queryRunner.dropTable('call_jobs_call_flows');
  }
}
