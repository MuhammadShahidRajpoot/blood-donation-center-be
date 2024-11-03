import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterBookingRulesAddFieldTableTenantId1708349811072
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'booking_rules_add_field',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        default: null,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('booking_rules_add_field', 'tenant_id');
  }
}
