import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDataSyncRecordExceptionsUpdateOperationTypeEnum1710424559875
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(
      `CREATE TYPE data_sync_record_exceptions_datasyncable_type_enum_new AS ENUM ('Donor','Donations','Appoinments','Drive', 'Session','Slots')`
    );
    await queryRunner.manager.query(`ALTER TABLE data_sync_record_exceptions
      ALTER COLUMN datasyncable_type
      TYPE data_sync_record_exceptions_datasyncable_type_enum_new
      USING datasyncable_type::text::data_sync_record_exceptions_datasyncable_type_enum_new`);

    await queryRunner.manager.query(
      `DROP TYPE data_sync_record_exceptions_datasyncable_type_enum`
    );
    await queryRunner.manager.query(
      `ALTER TYPE data_sync_record_exceptions_datasyncable_type_enum_new RENAME TO data_sync_record_exceptions_datasyncable_type_enum`
    );
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
