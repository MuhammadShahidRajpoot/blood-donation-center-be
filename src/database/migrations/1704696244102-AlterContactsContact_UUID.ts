import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterContactsContact_UUID1704696244102
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      ALTER table donors ALTER column contact_uuid TYPE uuid USING contact_uuid::UUID,
      ADD CONSTRAINT contact_uuid_unique_donor UNIQUE (contact_uuid);

      ALTER table crm_volunteer ALTER column contact_uuid TYPE uuid USING contact_uuid::UUID,
      ADD CONSTRAINT contact_uuid_unique_voluneer UNIQUE (contact_uuid);


      ALTER table staff ALTER column contact_uuid TYPE uuid USING contact_uuid::UUID,
      ADD CONSTRAINT contact_uuid_unique_staff UNIQUE (contact_uuid);
        `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        ALTER table donors drop column contact_uuid;
        ALTER TABLE donors ADD COLUMN contact_uuid uuid UNIQUE;

        ALTER table crm_volunteer drop column contact_uuid;
        ALTER TABLE crm_volunteer ADD COLUMN contact_uuid uuid UNIQUE;

        ALTER table staff drop column contact_uuid;
        ALTER TABLE staff ADD COLUMN contact_uuid uuid UNIQUE;
      
      `
    );
  }
}
