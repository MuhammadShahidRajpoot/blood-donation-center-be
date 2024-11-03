import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddedNewColumnInScheduleOperationTable1708680115439
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'schedule_operation',
      new TableColumn({
        name: 'is_paused_at',
        type: 'boolean',
        isNullable: true,
        default: false,
      })
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('schedule_operation', 'is_paused_at');
  }
}
