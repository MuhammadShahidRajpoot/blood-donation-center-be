import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterPromotionalItemCollectionOperationTenantId1708415530989
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'promotionalItem_collection_operations',
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
      'promotionalItem_collection_operations',
      'tenant_id'
    );
  }
}
