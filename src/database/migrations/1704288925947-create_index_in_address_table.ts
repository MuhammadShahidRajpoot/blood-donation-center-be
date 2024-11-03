import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class create_index_in_address1704288925947
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'address',
      new TableIndex({
        name: 'IDX_ADDRESS_ADDRESSABLE_ID',
        columnNames: ['addressable_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('address', 'IDX_ADDRESS_ADDRESSABLE_ID');
  }
}
