import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import genericHistoryColumns from '../common/generic-history-columns';

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

export class CreateApprovalsDetailsHistoryTable1702473851647
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the oc_approvals_details_history table
    await queryRunner.createTable(
      new Table({
        name: 'oc_approvals_details_history',
        columns: [
          ...genericHistoryColumns,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('oc_approvals_details_history');
  }
}
