import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterResoucreShareTableColumns1704702830599
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the composite primary keys
    await queryRunner.dropPrimaryKey('resource_sharings_fulfillment');

    // Change the data type of share_type_id to bigint
    await queryRunner.changeColumn(
      'resource_sharings_fulfillment',
      'share_type_id',
      new TableColumn({
        name: 'share_type_id',
        type: 'bigint',
        isNullable: false,
      })
    );

    // Add the 'id' column as the primary key
    await queryRunner.addColumn(
      'resource_sharings_fulfillment',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the composite primary keys
    await queryRunner.createPrimaryKey('resource_sharings_fulfillment', [
      'resource_share_id',
      'share_type_id',
    ]);

    // Remove the 'id' column
    await queryRunner.dropColumn('resource_sharings_fulfillment', 'id');

    // Change the data type of share_type_id back to its original type
    await queryRunner.changeColumn(
      'resource_sharings_fulfillment',
      'share_type_id',
      new TableColumn({
        name: 'share_type_id',
        type: 'bigint',
        isPrimary: true,
        isNullable: false,
      })
    );
  }
}
