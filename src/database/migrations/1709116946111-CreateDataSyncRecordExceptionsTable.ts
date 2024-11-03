import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';
import { DataSyncOperationTypeEnum } from '../../api/scheduler/enum/data_sync_operation_type.enum';
import { DataSyncDirectioneEnum } from '../../api/scheduler/enum/data_sync_direction.enum';

export class CreateDataSyncRecordExceptionsTable1709116946111
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'data_sync_record_exceptions',
        columns: [
          ...genericColumns,
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'datasyncable_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'datasyncable_type',
            type: 'enum',
            enum: Object.values(DataSyncOperationTypeEnum),
            isNullable: false,
          },
          {
            name: 'sync_direction',
            type: 'enum',
            enum: Object.values(DataSyncDirectioneEnum),
            isNullable: false,
          },
          {
            name: 'exception',
            type: 'text',
            isNullable: false,
            default: `''`,
          },
          {
            name: 'attempt',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'data_sync_record_exceptions',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'data_sync_record_exceptions',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      })
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('data_sync_record_exceptions');
  }
}
