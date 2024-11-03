import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLastYearColumnsInDonorsDonationsTable1712250692399 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN donation_ytd DROP NOT NULL');
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN donation_ltd DROP NOT NULL');
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN donation_last_year DROP NOT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN donation_ytd SET NOT NULL');
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN donation_ltd SET NOT NULL');
        await queryRunner.query('ALTER TABLE donors_donations ALTER COLUMN donation_last_year SET NOT NULL');
    }

}
