import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';

enum fieldApprovalStatusEnum {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
}

enum fieldEnum {
  date = 'date',
  shift_start_time = 'shift_start_time',
  shift_end_time = 'shift_end_time',
  shift_break_start_time = 'shift_break_start_time',
  shift_break_end_time = 'shift_break_end_time',
  devices = 'devices',
  vehicles = 'vehicles',
  location = 'location',
  recruiter = 'recruiter',
  operation_status = 'operation_status',
  owner = 'owner',
  open_to_public = 'open_to_public',
  certifications = 'certifications',
  projections = 'projections',
  marketing_items = 'marketing_items',
  promotional_items = 'promotional_items',
  procedure_type = 'procedure_type',
  procedure_type_qty = 'procedure_type_qty',
  product_yield = 'product_yield',
  staff_setups = 'staff_setups',
  slots = 'slots',
}

export class CreateApprovalsDetailsTable1702473851646
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the oc_approvals_details table
    await queryRunner.createTable(
      new Table({
        name: 'oc_approvals_details',
        columns: [
          ...genericColumns,
          { name: 'approval_id', type: 'bigint', isNullable: false },
          { name: 'shift_id', type: 'bigint', isNullable: true },
          {
            name: 'field_name',
            type: 'enum',
            enum: Object.values(fieldEnum),
            isNullable: false,
          },
          {
            name: 'field_approval_status',
            type: 'enum',
            enum: Object.values(fieldApprovalStatusEnum),
            isNullable: false,
          },
          {
            name: 'is_override',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'original_data',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'requested_data',
            type: 'jsonb',
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'oc_approvals_details',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_created_by',
      })
    );

    await queryRunner.createForeignKey(
      'oc_approvals_details',
      new TableForeignKey({
        columnNames: ['approval_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'oc_approvals',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_approval_id',
      })
    );

    await queryRunner.createForeignKey(
      'oc_approvals_details',
      new TableForeignKey({
        columnNames: ['shift_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shifts',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_shift_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('oc_approvals_details', 'FK_created_by');
    await queryRunner.dropForeignKey('oc_approvals_details', 'FK_approval_id');
    await queryRunner.dropForeignKey('oc_approvals_details', 'FK_shift_id');

    await queryRunner.dropTable('oc_approvals_details');
  }
}
