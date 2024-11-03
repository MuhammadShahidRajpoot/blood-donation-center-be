import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import genericColumns from '../common/generic-columns';

export class CreateCallJobContactsTable1710863400731
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_job_contacts',
        columns: [
          ...genericColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'segment_contact_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'no_of_retry',
            type: 'bigint',
            default: 0,
            isNullable: false,
          },
          {
            name: 'call_outcome_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'call_status',
            type: 'enum',
            enum: ['1', '2', '3'],
            isNullable: false,
            default: "'1'",
          },
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'call_job_contacts',
      new TableForeignKey({
        columnNames: ['call_job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_jobs',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_call_job_id',
      })
    );

    await queryRunner.createForeignKey(
      'call_job_contacts',
      new TableForeignKey({
        columnNames: ['segment_contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'segments_contacts',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_segment_contact_id',
      })
    );

    await queryRunner.createForeignKey(
      'call_job_contacts',
      new TableForeignKey({
        columnNames: ['call_outcome_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_outcomes',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'call_job_contacts',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'call_job_contacts',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('call_job_contacts', 'FK_call_job_id');

    await queryRunner.dropForeignKey(
      'call_job_contacts',
      'FK_segment_contact_id'
    );

    await queryRunner.dropForeignKey('call_job_contacts', 'FK_call_outcome_id');

    await queryRunner.dropForeignKey('call_job_contacts', 'FK_created_by');

    await queryRunner.dropForeignKey('call_job_contacts', 'FK_tenant_id');

    await queryRunner.dropTable('call_job_contacts');
  }
}
