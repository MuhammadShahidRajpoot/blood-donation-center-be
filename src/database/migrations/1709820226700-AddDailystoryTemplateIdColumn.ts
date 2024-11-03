import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDailystoryTemplateIdColumn1709820226700
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'email_template',
      new TableColumn({
        name: 'dailystory_template_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'email_template_history',
      new TableColumn({
        name: 'dailystory_template_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('email_template', 'dailystory_template_id');
    await queryRunner.dropColumn(
      'email_template_history',
      'dailystory_template_id'
    );
  }
}
