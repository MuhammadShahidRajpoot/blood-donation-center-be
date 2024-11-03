import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAddDS_SYNCColumnInProspectsTable1704960550480
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'prospects',
      new TableColumn({
        name: 'ds_sync',
        type: 'boolean',
        default: false,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('prospects', 'ds_sync');
  }
}
