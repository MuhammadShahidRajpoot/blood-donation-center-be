import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUserCollectionOperationTenantId1708424614098
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_business_units',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        default: null,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_business_units', 'tenant_id');
  }
}
