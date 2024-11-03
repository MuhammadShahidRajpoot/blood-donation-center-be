import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterContaminationAlertsTable1705554321500
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('contamination_alerts', [
      new TableColumn({
        name: 'key_not_found',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'is_resolved',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('contamination_alerts', [
      new TableColumn({
        name: 'key_not_found',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'is_resolved',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    ]);
  }
}
