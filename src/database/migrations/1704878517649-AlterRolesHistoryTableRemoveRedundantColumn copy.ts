import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterRolesHistoryTableRemoveRedundantColumn1704878517649
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('roles_history', 'is_autocreated')) {
      await queryRunner.dropColumn('roles_history', 'is_autocreated');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('roles_history', 'is_autocreated'))) {
      await queryRunner.addColumn(
        'roles_history',
        new TableColumn({
          name: 'is_autocreated',
          type: 'boolean',
          default: false,
          isNullable: false,
        })
      );
    }
  }
}
