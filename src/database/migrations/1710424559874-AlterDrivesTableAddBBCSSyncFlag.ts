import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDrivesTableAddBBCSSyncFlag1710424559874
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'drives',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.addColumn(
      'drives_history',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'drives',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.dropColumn(
      'drives_history',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }
}
