import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDrivesTablePromotionsHistoryColumns1705554321499
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'drives_history',
      'promotion_id',
      new TableColumn({
        name: 'promotion_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'drives_history',
      'promotion_id',
      new TableColumn({
        name: 'promotion_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
