import { MigrationInterface, QueryRunner } from "typeorm";

export class DonorDuplicateListView1713445732374 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE OR REPLACE VIEW donor_duplicates_list_view AS
            SELECT
                distinct("record"."id")  AS "record_id",
                CONCAT("record"."first_name", ' ', "record"."last_name") AS name,
                "record"."first_name" AS first_name,
                "record"."last_name" AS last_name,
                TRIM(BOTH ', ' FROM CONCAT("addresses"."address1", ', ', "addresses"."address2")) AS address,
                "addresses"."city" AS city,
                "phone"."data" AS primary_phone,
                "email"."data" AS primary_email,
                "record"."is_active" AS status,
                "dups"."duplicatable_id" AS "duplicatable_id",
                "dups"."duplicatable_type" AS "duplicatable_type",
                "dups"."is_resolved" AS "is_resolved",
                "dups"."tenant_id" AS "tenant_id",
                "dups"."is_archived" AS "is_archived"
            FROM
                "duplicates" "dups"
            INNER JOIN "user" "created_by" ON "created_by"."id" = "dups"."created_by" AND ("created_by"."deleted_at" IS NULL)
            INNER JOIN "donors" "record" ON "dups"."record_id" = "record"."id" AND ("record"."is_archived" = false)
            INNER JOIN "donors" "duplicatable" ON "dups"."duplicatable_id" = "duplicatable"."id" AND ("duplicatable"."is_archived" = false)
            LEFT JOIN "address" "addresses" ON "addresses"."addressable_id" = "record"."id" AND ("addresses"."addressable_type" = 'donors')
            LEFT JOIN "contacts" "phone" ON "phone"."contactable_id" = "record"."id" AND ("phone"."is_primary" = true AND "phone"."contactable_type" = 'donors' AND "phone"."contact_type" >= '1' AND "phone"."contact_type" <= '3')
            LEFT JOIN "contacts" "email" ON "email"."contactable_id" = "record"."id" AND ("email"."is_primary" = true AND "email"."contactable_type" = 'donors' AND "email"."contact_type" >= '4' AND "email"."contact_type" <= '6');
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP VIEW IF EXISTS donor_duplicates_list_view;");
    }

}
