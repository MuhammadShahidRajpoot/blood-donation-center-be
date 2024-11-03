import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTextColumnType1712309750938 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'dialing_centers_notes',
      'text',
      new TableColumn({
        name: 'text',
        type: 'text',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'dialing_centers_notes',
      'text',
      new TableColumn({
        name: 'text',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );
    await queryRunner.dropTable('dialing_centers_notes');
  }
}
