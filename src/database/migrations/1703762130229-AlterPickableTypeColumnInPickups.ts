import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FileName1703762130229 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('pickups', 'pickable_type');
    await queryRunner.addColumn(
      'pickups',
      new TableColumn({
        name: 'pickable_type',
        type: 'enum',
        enum: ['DRIVE', 'SESSION'],
        default: `'DRIVE'`,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('pickups', 'pickable_type');
    await queryRunner.addColumn(
      'pickups',
      new TableColumn({
        name: 'pickable_type',
        type: 'int',
        isNullable: false,
      })
    );
  }
}
