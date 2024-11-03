import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterBannerCollectionOperationTableTenantId1708352107340
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'banner_collection_operations',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        default: null,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('banner_collection_operations', 'tenant_id');
  }
}
