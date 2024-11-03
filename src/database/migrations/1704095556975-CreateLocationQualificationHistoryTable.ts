import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLocationQualificationHistoryTable1704095556975
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'location_qualifications_history',
        columns: [
          {
            name: 'rowkey',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'history_reason',
            type: 'varchar',
            length: '1',
            isNullable: false,
          },
          {
            name: 'id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'location_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'qualified_by',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'qualification_status',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'attachment_files',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'qualification_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'qualification_expires',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('location_qualifications_history');
  }
}
