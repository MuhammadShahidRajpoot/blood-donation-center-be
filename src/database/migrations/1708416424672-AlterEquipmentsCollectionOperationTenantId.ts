import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterEquipmentsCollectionOperationTenantId1708416424672
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'equipments_collection_operations',
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
      'equipments_collection_operations',
      'tenant_id'
    );
  }
}
