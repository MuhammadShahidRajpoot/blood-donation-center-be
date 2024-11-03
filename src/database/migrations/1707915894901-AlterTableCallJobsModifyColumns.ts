import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableCallJobsModifyColumns1707915894901
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_jobs', 'date');
    await queryRunner.dropColumn('call_jobs', 'frequency');
    await queryRunner.dropColumn('call_jobs', 'type');

    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'start_date',
        type: 'timestamp',
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'end_date',
        type: 'timestamp',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'date',
        type: 'timestamp',
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'frequency',
        type: 'int',
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '20',
        isNullable: false,
      })
    );

    await queryRunner.dropColumn('call_jobs', 'start_date');
    await queryRunner.dropColumn('call_jobs', 'end_date');
  }
}
