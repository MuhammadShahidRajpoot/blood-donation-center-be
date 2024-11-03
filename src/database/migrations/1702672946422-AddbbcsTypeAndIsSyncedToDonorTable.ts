import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FileName1702672946422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'bbcs_donor_type',
        type: 'enum',
        enum: ['NOMATCH', 'EXACT', 'MULTIEXACT', 'LASTONLY'],
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'is_synced',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'bbcs_state',
        type: 'varchar',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donors', 'is_synced');

    await queryRunner.dropColumn('donors', 'bbcs_donor_type');
    await queryRunner.dropColumn('donors', 'bbcs_state');
  }
}
