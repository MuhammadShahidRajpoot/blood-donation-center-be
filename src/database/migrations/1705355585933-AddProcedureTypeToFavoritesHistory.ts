import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProcedureTypeTofavorites_historyHistory1705355585933
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('favorites_history', 'procedure_id');

    await queryRunner.addColumn(
      'favorites_history',
      new TableColumn({
        name: 'procedure_type_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'favorites_history',
      new TableColumn({
        name: 'procedure_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.dropColumn('favorites_history', 'procedure_type_id');
  }
}
