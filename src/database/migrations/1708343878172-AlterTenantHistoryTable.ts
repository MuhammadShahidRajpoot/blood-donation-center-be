import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTenantHistoryTable1708343878172
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'tenant_history',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tenant_history',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive'],
      })
    );
  }
}
