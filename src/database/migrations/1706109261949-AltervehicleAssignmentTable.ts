import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AltervehicleAssignmentTable1706109261949
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'vehicles_assignments',
      new TableColumn({
        name: 'split_shift',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'vehicles_assignments',
      new TableColumn({
        name: 'split_shift',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }
}
