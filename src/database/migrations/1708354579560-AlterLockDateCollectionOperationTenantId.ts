import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterLockDateCollectionOperationTenantId1708354579560
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'lock_date_collection_operations',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        default: null,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'lock_date_collection_operations',
      'tenant_id'
    );
  }
}
