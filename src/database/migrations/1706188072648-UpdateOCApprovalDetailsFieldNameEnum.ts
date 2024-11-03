import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOCApprovalDetailsFieldNameEnum1706188072648
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(
      `CREATE TYPE oc_approvals_details_field_name_enum_new AS ENUM (
      'date',
      'shift_start_time',
      'shift_end_time',
      'shift_break_start_time',
      'shift_break_end_time',
      'devices',
      'vehicles',
      'location',
      'recruiter',
      'operation_status',
      'owner',
      'open_to_public',
      'certifications',
      'projections',
      'marketing_items',
      'promotional_items',
      'procedure_type',
      'procedure_type_qty',
      'product_yield',
      'staff_setups',
      'slots',
      'sms',
      'email',
      'telerecruitment')`
    );
    await queryRunner.manager.query(`ALTER TABLE oc_approvals_details
      ALTER COLUMN field_name
      TYPE oc_approvals_details_field_name_enum_new
      USING field_name::text::oc_approvals_details_field_name_enum_new`);
    await queryRunner.manager.query(`ALTER TABLE oc_approvals_details_history
      ALTER COLUMN field_name
      TYPE oc_approvals_details_field_name_enum_new
      USING field_name::text::oc_approvals_details_field_name_enum_new`);

    await queryRunner.manager.query(
      `DROP TYPE oc_approvals_details_field_name_enum`
    );
    await queryRunner.manager.query(
      `ALTER TYPE oc_approvals_details_field_name_enum_new RENAME TO oc_approvals_details_field_name_enum`
    );
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
