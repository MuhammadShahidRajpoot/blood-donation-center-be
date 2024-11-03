import { MigrationInterface, QueryRunner } from 'typeorm';
export class UpdateRequestTypeEnum1705554321494 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(
      `CREATE TYPE oc_approvals_request_type_enum_new AS ENUM ('Third Rail Field', 'Marketing Update', 'Both')`
    );
    await queryRunner.manager.query(`ALTER TABLE oc_approvals
      ALTER COLUMN request_type
      TYPE oc_approvals_request_type_enum_new
      USING request_type::text::oc_approvals_request_type_enum_new`);
    await queryRunner.manager.query(`ALTER TABLE oc_approvals_history
      ALTER COLUMN request_type
      TYPE oc_approvals_request_type_enum_new
      USING request_type::text::oc_approvals_request_type_enum_new`);

    await queryRunner.manager.query(`DROP TYPE oc_approvals_request_type_enum`);
    await queryRunner.manager.query(
      `ALTER TYPE oc_approvals_request_type_enum_new RENAME TO oc_approvals_request_type_enum`
    );
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
