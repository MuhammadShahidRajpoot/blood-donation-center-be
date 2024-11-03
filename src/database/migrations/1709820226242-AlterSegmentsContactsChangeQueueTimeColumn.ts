import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterSegmentsContactsChangeQueueTimeColumn1709820226242
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'segments_contacts',
      'queue_time',
      new TableColumn({
        name: 'queue_time',
        type: 'time without time zone',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'segments_contacts',
      'queue_time',
      new TableColumn({
        name: 'queue_time',
        type: 'varchar',
        length: '15',
        isNullable: true,
      })
    );
  }
}
