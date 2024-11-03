import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class CreateIndexInAddressTable1711608745018 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createIndex(
            'address',
            new TableIndex({
                name: 'IDX_ADDRESS_CITY',
                columnNames: ['city'],
            })
        );

        await queryRunner.createIndex(
            'address',
            new TableIndex({
                name: 'IDX_ADDRESS_STATE',
                columnNames: ['state'],
            })
        );

        await queryRunner.createIndex(
            'address',
            new TableIndex({
                name: 'IDX_ADDRESS_COUNTY',
                columnNames: ['county'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('address', 'IDX_ADDRESS_CITY');
        await queryRunner.dropIndex('address', 'IDX_ADDRESS_STATE');
        await queryRunner.dropIndex('address', 'IDX_ADDRESS_COUNTY');
    }

}
