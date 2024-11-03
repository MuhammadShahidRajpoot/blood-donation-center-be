import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAddressTableAddColumnShortState1703853841830
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'address',
      new TableColumn({
        name: 'short_state',
        type: 'varchar',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('address', 'short_state');
  }
}
