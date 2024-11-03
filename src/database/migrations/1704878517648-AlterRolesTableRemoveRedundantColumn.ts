import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterRolesTableRemoveRedundantColumn1704878517648
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('roles', 'is_autocreated')) {
      await queryRunner.dropColumn('roles', 'is_autocreated');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('roles', 'is_autocreated'))) {
      await queryRunner.addColumn(
        'roles',
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
