import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import genericHistoryColumns from '../common/generic-history-columns';

export enum operationTypeEnum {
  session = 'session',
  drive = 'drive',
  nce = 'non_collection_events',
}

export enum requestStatusEnum {
  pending = 'Pending',
  resolved = 'Resolved',
}

export enum requestTypeEnum {
  third_rail_failed = 'Third Rail Field',
  marketing_update = 'Marketing Update',
}

export class CreateApprovalsHistoryTable1702473851645
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the oc_approvals_history table
    await queryRunner.createTable(
      new Table({
        name: 'oc_approvals_history',
        columns: [
          ...genericHistoryColumns,
          { name: 'operationable_id', type: 'bigint', isNullable: false },
          {
            name: 'operationable_type',
            type: 'varchar',
            length: '21',
            isNullable: false,
          },
          {
            name: 'request_type',
            type: 'enum',
            enum: Object.values(requestTypeEnum),
            isNullable: false,
          },
          {
            name: 'request_status',
            type: 'enum',
            enum: Object.values(requestStatusEnum),
            isNullable: false,
          },
          {
            name: 'is_discussion_required',
            type: 'boolean',
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('oc_approvals_history');
  }
}
