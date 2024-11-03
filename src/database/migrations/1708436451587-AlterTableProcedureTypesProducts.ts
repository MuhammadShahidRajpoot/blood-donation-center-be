import { MigrationInterface, TableColumn, QueryRunner } from 'typeorm';

export class AlterTableProcedureTypesProducts1708436451587
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'procedure_types_products',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        default: null,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('procedure_types_products', 'tenant_id');
  }
}
