import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class CreateIndexInFacilityTable1711498706605 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createIndex(
            'facility',
            new TableIndex({
                name: 'IDX_FACILITY_DONOR_CENTER',
                columnNames: ['donor_center'],
            })
        );

        await queryRunner.createIndex(
            'facility',
            new TableIndex({
                name: 'IDX_FACILITY_STATUS',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'facility',
            new TableIndex({
                name: 'IDX_FACILITY_IS_ARCHIVED',
                columnNames: ['is_archived'],
            })
        );

        await queryRunner.createIndex(
            'facility',
            new TableIndex({
                name: 'IDX_FACILITY_NAME',
                columnNames: ['name'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('facility', 'IDX_FACILITY_DONOR_CENTER');
        await queryRunner.dropIndex('facility', 'IDX_FACILITY_IS_ARCHIVED');
        await queryRunner.dropIndex('facility', 'IDX_FACILITY_STATUS');
        await queryRunner.dropIndex('facility', 'IDX_FACILITY_NAME');
    }

}
