import { DataSyncDirectioneEnum } from '../../api/scheduler/enum/data_sync_direction.enum';
import { ExecutionStatusEnum } from '../../api/scheduler/enum/execution_status.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterBBCSDataSyncsToDataSyncBatchOperations1709116946110
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('bbcs_data_syncs', [
      new TableColumn({
        name: 'sync_direction',
        type: 'enum',
        enum: Object.values(DataSyncDirectioneEnum),
        default: `'${DataSyncDirectioneEnum.BBCS_TO_D37}'`,
        isNullable: false,
      }),
      new TableColumn({
        name: 'exception',
        type: 'text',
        isNullable: false,
        default: `''`,
      }),
      new TableColumn({
        name: 'is_failed',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'start_date',
        type: 'timestamp',
        precision: 6,
        isNullable: true,
      }),
      new TableColumn({
        name: 'end_date',
        type: 'timestamp',
        precision: 6,
        isNullable: true,
      }),
      new TableColumn({
        name: 'attempt',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'execution_status',
        type: 'enum',
        enum: Object.values(ExecutionStatusEnum),
        default: `'${ExecutionStatusEnum.Completed}'`,
        isNullable: false,
      }),
      new TableColumn({
        name: 'updated_date',
        type: 'timestamp',
        precision: 6,
        isNullable: true,
      }),
    ]);

    await queryRunner.dropColumns('bbcs_data_syncs', [
      new TableColumn({
        name: 'status',
        type: 'boolean',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_running',
        type: 'boolean',
        isNullable: true,
      }),
    ]);
    await queryRunner.renameColumn(
      'bbcs_data_syncs',
      'type',
      'data_sync_operation_type'
    );
    await queryRunner.renameTable(
      'bbcs_data_syncs',
      'data_sync_batch_operations'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('data_sync_batch_operations', [
      new TableColumn({
        name: 'sync_direction',
        type: 'enum',
        enum: Object.values(DataSyncDirectioneEnum),
        default: `'${DataSyncDirectioneEnum.BBCS_TO_D37}'`,
        isNullable: false,
      }),
      new TableColumn({
        name: 'exception',
        type: 'text',
        isNullable: false,
        default: '',
      }),
      new TableColumn({
        name: 'is_failed',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'start_date',
        type: 'timestamp',
        precision: 6,
        isNullable: true,
      }),
      new TableColumn({
        name: 'end_date',
        type: 'timestamp',
        precision: 6,
        isNullable: true,
      }),
      new TableColumn({
        name: 'attempt',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'execution_status',
        type: 'enum',
        enum: Object.values(ExecutionStatusEnum),
        default: `'${ExecutionStatusEnum.Completed}'`,
        isNullable: false,
      }),
      new TableColumn({
        name: 'updated_date',
        type: 'timestamp',
        precision: 6,
        isNullable: true,
      }),
    ]);

    await queryRunner.addColumns('data_sync_batch_operations', [
      new TableColumn({
        name: 'status',
        type: 'boolean',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_running',
        type: 'boolean',
        isNullable: true,
      }),
    ]);
    await queryRunner.renameColumn(
      'data_sync_batch_operations',
      'data_sync_operation_type',
      'type'
    );
    await queryRunner.renameTable(
      'data_sync_batch_operations',
      'bbcs_data_syncs'
    );
  }
}
