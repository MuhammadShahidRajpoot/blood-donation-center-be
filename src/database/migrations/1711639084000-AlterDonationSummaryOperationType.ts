import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDonationSummaryOperationType1711639084000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('donations_summary_history');

    await queryRunner.changeColumn(
      'donation_summary',
      'operationable_type',
      new TableColumn({ name: 'operationable_type', type: 'varchar' })
    );

    await queryRunner.changeColumn(
      'donation_summary_history',
      'operationable_type',
      new TableColumn({ name: 'operationable_type', type: 'varchar' })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donation_summary',
      'operationable_type',
      new TableColumn({
        name: 'operationable_type',
        type: 'int',
      })
    );

    await queryRunner.changeColumn(
      'donation_summary_history',
      'operationable_type',
      new TableColumn({ name: 'operationable_type', type: 'int' })
    );
  }
}
