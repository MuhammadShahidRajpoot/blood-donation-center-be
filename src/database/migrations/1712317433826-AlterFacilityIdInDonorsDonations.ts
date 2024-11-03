import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterFacilityIdInDonorsDonations1712317433826 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN facility_id DROP NOT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN facility_id SET NOT NULL');
    }

}
