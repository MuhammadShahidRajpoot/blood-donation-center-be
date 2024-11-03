import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterPromotionsCollectionOperationTenantId1708356133247
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'promotions_collection_operations',
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
      'promotions_collection_operations',
      'tenant_id'
    );
  }
}
