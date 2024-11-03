import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterSessionHistoryTableChangeAuditFields1703851785739
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'sessions_history',
      new TableColumn({
        name: 'changes_from',
        type: 'varchar',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'sessions_history',
      new TableColumn({
        name: 'changes_to',
        type: 'varchar',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'sessions_history',
      new TableColumn({
        name: 'changes_field',
        type: 'varchar',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'sessions_history',
      new TableColumn({
        name: 'changed_when',
        type: 'varchar',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sessions_history', 'changes_from');

    await queryRunner.dropColumn('sessions_history', 'changes_to');

    await queryRunner.dropColumn('sessions_history', 'changes_field');

    await queryRunner.dropColumn('drives_history', 'changed_when');
  }
}
