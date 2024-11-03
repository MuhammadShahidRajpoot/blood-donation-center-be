import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterCreatedAtWithTimezone1713860950862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE crm_locations
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE devices_assignments
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE devices_assignments_drafts
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE drives
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE oc_non_collection_events
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE notifications
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE notifications_staff
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE operations_status
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE schedule
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE schedule_operation
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE sessions
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE shifts
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE shifts_devices
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE shifts_projections_staff
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE shifts_vehicles
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE staff_assignments
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
        await queryRunner.query(`
            ALTER TABLE staff_assignments_drafts
            ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE crm_locations
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE devices_assignments
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE devices_assignments_drafts
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE drives
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE oc_non_collection_events
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE notifications
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE notifications_staff
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE operations_status
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE schedule
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE schedule_operation
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE sessions
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE shifts
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE shifts_devices
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE shifts_projections_staff
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE shifts_vehicles
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE staff_assignments
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
        await queryRunner.query(`
            ALTER TABLE staff_assignments_drafts
            ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
        `);
    }

}
