import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class create_index_in_contact_preferences_table1704289696955
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'contact_preferences',
      new TableIndex({
        name: 'IDX_CONTACT_PREFERENCES_CONTACT_PREFERENCE_ID',
        columnNames: ['contact_preferenceable_id'],
      })
    );

    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'IDX_CONTACTS_CONTACTABLE_ID',
        columnNames: ['contactable_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'contact_preferences',
      'IDX_CONTACT_PREFERENCES_CONTACT_PREFERENCE_ID'
    );

    await queryRunner.dropIndex('contacts', 'IDX_CONTACTS_CONTACTABLE_ID');
  }
}
