import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class CreateIndexingInVoluntee1712045204620 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createIndex(
            'crm_volunteer',
            new TableIndex({
                name: 'IDX_FIRST_NAME',
                columnNames: ['first_name'],
            })
        );
 
        await queryRunner.createIndex(
            'crm_volunteer',
            new TableIndex({
                name: 'IDX_LAST_NAME',
                columnNames: ['last_name'],
            })
        );
 
        await queryRunner.createIndex(
            'crm_volunteer',
            new TableIndex({
                name: 'IDX_IS_ACTIVE',
                columnNames: ['is_active'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('crm_volunteer', 'IDX_FIRST_NAME');
        await queryRunner.dropIndex('crm_volunteer', 'IDX_LAST_NAME');
        await queryRunner.dropIndex('crm_volunteer', 'IDX_IS_ACTIVE');
    }

}
