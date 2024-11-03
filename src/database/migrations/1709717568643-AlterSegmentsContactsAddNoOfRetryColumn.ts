import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterSegmentsContactsAddNoOfRetryColumn1709717568643
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'segments_contacts',
      new TableColumn({
        name: 'no_of_retry',
        type: 'bigint',
        default: 0,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('segments_contacts', 'no_of_retry');
  }
}
