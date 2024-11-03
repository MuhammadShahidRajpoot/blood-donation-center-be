import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterRolesTableAddAutoCreatedColumn1701513773531
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('roles_history', 'is_auto_created'))) {
      await queryRunner.addColumn(
        'roles_history',
        new TableColumn({
          name: 'is_auto_created',
          type: 'boolean',
          default: false,
          isNullable: false,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('roles_history', 'is_auto_created')) {
      await queryRunner.dropColumn('roles_history', 'is_auto_created');
    }
  }
}
