import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';

export class CreateDialingCenterCallJobsTable1707922640429
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dialing_center_call_jobs',
        columns: [
          ...genericColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'actual_calls',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_start_calling',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
        ],
      })
    );
    await queryRunner.createForeignKey(
      'dialing_center_call_jobs',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'dialing_center_call_jobs',
      new TableForeignKey({
        columnNames: ['call_job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_jobs',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'dialing_center_call_jobs',
      'FK_created_by'
    );
    await queryRunner.dropForeignKey(
      'dialing_center_call_jobs',
      'FK_call_job_id'
    );

    await queryRunner.dropTable('dialing_center_call_jobs');
  }
}
