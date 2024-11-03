import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUUIDDonorsDonations1712565367935 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'donors_donations',
            new TableColumn({
                name: 'bbcs_uuid',
                type: 'text',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('donors_donations', 'bbcs_uuid');
    }

}
