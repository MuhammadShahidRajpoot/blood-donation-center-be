import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnDailyStoryMessageIdInCommunicationTable1712122118184
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the 'dailystory_message_id' column to the 'communications' table
    await queryRunner.addColumn(
      'communications',
      new TableColumn({
        name: 'dailystory_message_id',
        type: 'varchar',
        isNullable: true,
        length: '255',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the 'dailystory_message_id' column from the 'communications' table
    await queryRunner.dropColumn('communications', 'dailystory_message_id');
  }
}
