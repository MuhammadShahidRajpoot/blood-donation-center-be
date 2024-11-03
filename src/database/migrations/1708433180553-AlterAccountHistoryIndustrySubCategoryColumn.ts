import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAccountHistoryIndustrySubCategoryColumn1708433180553
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'accounts_history',
      'industry_subcategory',
      new TableColumn({
        name: 'industry_subcategory',
        type: 'bigint',
        isNullable: true, // Set nullable to true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // If needed, you can implement the down migration to revert the changes
    // For example, setting nullable back to false
    await queryRunner.changeColumn(
      'accounts_history',
      'industry_subcategory',
      new TableColumn({
        name: 'industry_subcategory',
        type: 'bigint',
        isNullable: false, // Set nullable back to false
      })
    );
  }
}
