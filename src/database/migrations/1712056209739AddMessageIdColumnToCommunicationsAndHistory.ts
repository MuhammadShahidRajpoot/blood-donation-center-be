import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export class AddMessageIdColumnToCommunicationsAndHistory1712056209739
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'message_id' column to 'communications' table
    await queryRunner.addColumn(
      'communications',
      new TableColumn({
        name: 'message_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
    // Add 'message_id' column to 'communications_history' table
    await queryRunner.addColumn(
      'communications_history',
      new TableColumn({
        name: 'message_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop 'message_id' column from 'communications' table
    await queryRunner.dropColumn('communications', 'message_id');
    // Drop 'message_id' column from 'communications_history' table
    await queryRunner.dropColumn('communications_history', 'message_id');
  }
}