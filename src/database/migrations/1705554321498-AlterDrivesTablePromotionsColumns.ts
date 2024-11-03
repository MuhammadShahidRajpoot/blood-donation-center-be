import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDrivesTablePromotionsColumns1705554321498
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'drives',
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
      'drives',
      'promotion_id',
      new TableColumn({
        name: 'promotion_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
