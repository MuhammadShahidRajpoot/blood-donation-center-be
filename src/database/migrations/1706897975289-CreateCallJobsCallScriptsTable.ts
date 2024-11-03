import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCallJobsCallScriptsTable1706897975289
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_call_scripts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'call_script_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'tenant_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      'call_jobs_call_scripts',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs_call_scripts',
      new TableForeignKey({
        columnNames: ['call_script_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_scripts',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_jobs_call_scripts');
  }
}
