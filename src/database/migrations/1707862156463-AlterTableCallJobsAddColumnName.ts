import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableCallJobsAddColumnName1707862156463
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE call_jobs DROP COLUMN name;');
  }
}
