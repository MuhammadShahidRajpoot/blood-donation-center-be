import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FileName1704704325168 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'resource_sharings_fulfillment_history',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('resource_sharings_fulfillment_history', 'id');
  }
}
