import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCloseDateCollectionOperationTenantId1708354712737
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'close_date_collection_operations',
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
      'close_date_collection_operations',
      'tenant_id'
    );
  }
}
