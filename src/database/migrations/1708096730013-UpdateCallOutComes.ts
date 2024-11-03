import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateCallOutComes1708096730013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_outcomes',
      new TableColumn({
        name: 'is_default',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_outcomes', 'is_default');
  }
}
