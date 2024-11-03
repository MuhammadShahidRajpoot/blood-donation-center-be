import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterDonorsTableRemoveColumnbbcsState1703853841831
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donors', 'bbcs_state');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'bbcs_state',
        type: 'varchar',
        isNullable: true,
      })
    );
  }
}
