import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddingIndexInShiftsTable1713779943623
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'shifts',
      new TableIndex({
        name: 'IDX_SHIFTS_SHITABLE_TYPE',
        columnNames: ['shiftable_type'],
      })
    );
    await queryRunner.createIndex(
      'shifts',
      new TableIndex({
        name: 'IDX_SHIFTS_SHITABLE_ID',
        columnNames: ['shiftable_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('shifts', 'IDX_SHIFTS_SHITABLE_TYPE');
    await queryRunner.dropIndex('shifts', 'IDX_SHIFTS_SHITABLE_ID');
  }
}
