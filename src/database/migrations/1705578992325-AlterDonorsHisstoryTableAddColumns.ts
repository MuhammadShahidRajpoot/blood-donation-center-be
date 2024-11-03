import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDonorsHistoryTableAddColumns1705578992325
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donors_history',
      'blood_type',
      new TableColumn({
        name: 'blood_group_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donors_history',
      'blood_type_id',
      new TableColumn({
        name: 'blood_type',
        type: 'varchar',
        length: '60',
        isNullable: true,
      })
    );
  }
}
