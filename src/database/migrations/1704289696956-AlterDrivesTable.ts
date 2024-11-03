import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDrivesTable1704289696956 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('drives', [
      new TableColumn({
        name: 'approval_status',
        type: 'enum',
        isNullable: true,
        enum: ['approved', 'pending'],
      }),
      new TableColumn({
        name: 'marketing_items_status',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
      new TableColumn({
        name: 'promotional_items_status',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('drives', [
      new TableColumn({
        name: 'approval_status',
        type: 'enum',
        default: 'pending',
        enum: ['approved', 'pending'],
      }),
      new TableColumn({
        name: 'marketing_items_status',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
      new TableColumn({
        name: 'promotional_items_status',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    ]);
  }
}
