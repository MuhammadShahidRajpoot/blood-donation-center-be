import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCollectionOperationIDColInNCEHistory1702634042200
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'oc_non_collection_events_history',
      'collection_operation_id'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'oc_non_collection_events_history',
      new TableColumn({
        name: 'collection_operation_id',
        type: 'bigint',
        isArray: false,
        isNullable: true,
      })
    );
  }
}
