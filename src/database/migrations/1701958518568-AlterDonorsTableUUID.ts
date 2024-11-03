import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDonorsTableUUID1701958518568 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'uuid',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donors', 'uuid');
  }
}
