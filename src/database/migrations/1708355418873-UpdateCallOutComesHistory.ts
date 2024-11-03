import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateCallOutComesHistory1708355418873
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_outcomes_history',
      new TableColumn({
        name: 'is_default',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_outcomes_history', 'is_default');
  }
}
