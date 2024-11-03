import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AlterQualificationExpiresISNullTrueLocationQualificationsHistory1704373335305
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'location_qualifications_history',
      new TableColumn({
        name: 'qualification_expires',
        type: 'timestamp',
        isNullable: false,
      }),
      new TableColumn({
        name: 'qualification_expires',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'location_qualifications_history',
      new TableColumn({
        name: 'qualification_expires',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'qualification_expires',
        type: 'timestamp',
        isNullable: false,
      })
    );
  }
}
