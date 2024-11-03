import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCCRoleNameColumn1712674069906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'cc_role_name',
        type: 'varchar',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'roles',
      new TableColumn({
        name: 'cc_role_name',
        type: 'varchar',
        isNullable: true,
      })
    );
  }
}
