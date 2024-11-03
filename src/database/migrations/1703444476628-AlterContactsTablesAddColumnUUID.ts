import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterContactsTablesAddColumnUUIDUUID1703444476628
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'contact_uuid',
        type: 'text',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'crm_volunteer',
      new TableColumn({
        name: 'contact_uuid',
        type: 'text',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'staff',
      new TableColumn({
        name: 'contact_uuid',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'donors',
      new TableColumn({
        name: 'contact_uuid',
        type: 'text',
        isNullable: true,
      })
    );
    await queryRunner.dropColumn(
      'staff',
      new TableColumn({
        name: 'contact_uuid',
        type: 'text',
        isNullable: true,
      })
    );
    await queryRunner.dropColumn(
      'crm_volunteer',
      new TableColumn({
        name: 'contact_uuid',
        type: 'text',
        isNullable: true,
      })
    );
  }
}
