import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FileName1706188072647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('procedure_types', [
      new TableColumn({
        name: 'becs_product_category',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'external_reference',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
    await queryRunner.addColumn(
      'procedure',
      new TableColumn({
        name: 'short_description',
        type: 'varchar',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('procedure_type', 'becs_product_category');
    await queryRunner.dropColumn('procedure_types', 'external_reference');
    await queryRunner.dropColumn('procedure', 'short_description');
  }
}
