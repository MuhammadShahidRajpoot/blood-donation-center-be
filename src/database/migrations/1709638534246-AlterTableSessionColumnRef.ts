import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableSessionColumnRef1709638534246
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('sessions', [
      new TableColumn({
        name: 'ref_type',
        type: 'varchar(250)',
        isNullable: true,
      }),
      new TableColumn({
        name: 'ref_id',
        type: 'bigint',
        isNullable: true,
      }),
    ]);
    await queryRunner.addColumns('sessions_history', [
      new TableColumn({
        name: 'ref_type',
        type: 'varchar(250)',
        isNullable: true,
      }),
      new TableColumn({
        name: 'ref_id',
        type: 'bigint',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('sessions', ['ref_type', 'ref_id']);
    await queryRunner.dropColumns('sessions_history', ['ref_type', 'ref_id']);
  }
}
