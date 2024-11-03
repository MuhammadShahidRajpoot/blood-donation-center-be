import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOperationStatusTable1704875113362
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule_operation',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'operation_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'schedule_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'pending_assignment',
            type: 'boolean',
            default: false,
          },
          {
            name: 'in_sync',
            type: 'boolean',
            default: false,
          },
          {
            name: 'to_be_removed',
            type: 'boolean',
            default: false,
          },

          {
            name: 'operation_type',
            type: 'text',
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
        ],
      })
    );
    await queryRunner.createForeignKey(
      'schedule_operation',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'schedule_operation',
      new TableForeignKey({
        columnNames: ['schedule_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'schedule',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('schedule_operation', 'FK_created_by');
    await queryRunner.dropForeignKey('schedule_operation', 'FK_schedule_id');
    await queryRunner.dropTable('schedule_operation');
  }
}
