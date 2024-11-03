import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';

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

export class CreateApprovalsTable1702473851644 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the oc_approvals table
    await queryRunner.createTable(
      new Table({
        name: 'oc_approvals',
        columns: [
          ...genericColumns,
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

    await queryRunner.createForeignKey(
      'oc_approvals',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_created_by',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('oc_approvals', 'FK_created_by');
    await queryRunner.dropTable('oc_approvals');
  }
}
