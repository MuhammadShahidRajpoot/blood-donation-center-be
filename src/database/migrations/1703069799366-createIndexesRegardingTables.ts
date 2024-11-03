import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesRegardingTables1703069799366
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* account_affiliations table */
    await queryRunner.createIndex(
      'account_affiliations',
      new TableIndex({
        name: 'IDX_ACCOUNT_AFFILIATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'account_affiliations',
      new TableIndex({
        name: 'IDX_ACCOUNT_AFFILIATIONS_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );

    await queryRunner.createIndex(
      'account_affiliations',
      new TableIndex({
        name: 'IDX_ACCOUNT_AFFILIATIONS_AFFILIATION_ID',
        columnNames: ['affiliation_id'],
      })
    );
    /* account_affiliations table end */

    /* account_affiliations_history table */
    await queryRunner.createIndex(
      'account_affiliations_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_AFFILIATIONS_HISTORY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'account_affiliations_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_AFFILIATIONS_HISTORY_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );

    await queryRunner.createIndex(
      'account_affiliations_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_AFFILIATIONS_HISTORY_AFFILIATION_ID',
        columnNames: ['affiliation_id'],
      })
    );
    /* account_affiliations_history table end */

    /* account_contacts table */
    await queryRunner.createIndex(
      'account_contacts',
      new TableIndex({
        name: 'IDX_ACCOUNT_CONTACTS_RECORD_ID',
        columnNames: ['record_id'],
      })
    );

    await queryRunner.createIndex(
      'account_contacts',
      new TableIndex({
        name: 'IDX_ACCOUNT_CONTACTS_CONTACTABLE_ID',
        columnNames: ['contactable_id'],
      })
    );

    await queryRunner.createIndex(
      'account_contacts',
      new TableIndex({
        name: 'IDX_ACCOUNT_CONTACTS_ROLE_ID',
        columnNames: ['role_id'],
      })
    );
    /* account_contacts table end */

    /* account_contacts_history table */
    await queryRunner.createIndex(
      'account_contacts_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_CONTACTS_HISTORY_RECORD_ID',
        columnNames: ['record_id'],
      })
    );

    await queryRunner.createIndex(
      'account_contacts_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_CONTACTS_HISTORY_CONTACTABLE_ID',
        columnNames: ['contactable_id'],
      })
    );

    await queryRunner.createIndex(
      'account_contacts_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_CONTACTS_HISTORY_ROLE_ID',
        columnNames: ['role_id'],
      })
    );
    /* account_contacts_history table end */

    /* account_preferences table */
    await queryRunner.createIndex(
      'account_preferences',
      new TableIndex({
        name: 'IDX_ACCOUNT_PREFERENCES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'account_preferences',
      new TableIndex({
        name: 'IDX_ACCOUNT_PREFERENCES_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );

    await queryRunner.createIndex(
      'account_preferences',
      new TableIndex({
        name: 'IDX_ACCOUNT_PREFERENCES_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );
    /* account_preferences table end */

    /* account_preferences_history table */
    await queryRunner.createIndex(
      'account_preferences_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_PREFERENCES_HISTORY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'account_preferences_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_PREFERENCES_HISTORY_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );

    await queryRunner.createIndex(
      'account_preferences_history',
      new TableIndex({
        name: 'IDX_ACCOUNT_PREFERENCES_HISTORY_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );
    /* account_preferences_history table end */

    /* accounts table */
    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_INDUSTRY_CATEGORY',
        columnNames: ['industry_category'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_INDUSTRY_SUBCATEGORY',
        columnNames: ['industry_subcategory'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_STAGE',
        columnNames: ['stage'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_SOURCE',
        columnNames: ['source'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_COLLECTION_OPERATION',
        columnNames: ['collection_operation'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_RECRUITER',
        columnNames: ['recruiter'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_TERRITORY',
        columnNames: ['territory'],
      })
    );

    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    /* accounts table end */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes account_affiliations
    await queryRunner.dropIndex(
      'account_affiliations',
      'IDX_ACCOUNT_AFFILIATIONS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'account_affiliations',
      'IDX_ACCOUNT_AFFILIATIONS_ACCOUNT_ID'
    );

    await queryRunner.dropIndex(
      'account_affiliations',
      'IDX_ACCOUNT_AFFILIATIONS_AFFILIATION_ID'
    );

    // Drop indexes account_affiliations_history
    await queryRunner.dropIndex(
      'account_affiliations_history',
      'IDX_ACCOUNT_AFFILIATIONS_HISTORY_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'account_affiliations_history',
      'IDX_ACCOUNT_AFFILIATIONS_HISTORY_ACCOUNT_ID'
    );

    await queryRunner.dropIndex(
      'account_affiliations_history',
      'IDX_ACCOUNT_AFFILIATIONS_HISTORY_AFFILIATION_ID'
    );

    // Drop indexes account_contacts
    await queryRunner.dropIndex(
      'account_contacts',
      'IDX_ACCOUNT_CONTACTS_RECORD_ID'
    );

    await queryRunner.dropIndex(
      'account_contacts',
      'IDX_ACCOUNT_CONTACTS_CONTACTABLE_ID'
    );

    await queryRunner.dropIndex(
      'account_contacts',
      'IDX_ACCOUNT_CONTACTS_ROLE_ID'
    );

    // Drop indexes account_contacts_history
    await queryRunner.dropIndex(
      'account_contacts_history',
      'IDX_ACCOUNT_CONTACTS_HISTORY_RECORD_ID'
    );

    await queryRunner.dropIndex(
      'account_contacts_history',
      'IDX_ACCOUNT_CONTACTS_HISTORY_CONTACTABLE_ID'
    );

    await queryRunner.dropIndex(
      'account_contacts_history',
      'IDX_ACCOUNT_CONTACTS_HISTORY_ROLE_ID'
    );

    // Drop indexes account_preferences
    await queryRunner.dropIndex(
      'account_preferences',
      'IDX_ACCOUNT_PREFERENCES_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'account_preferences',
      'IDX_ACCOUNT_PREFERENCES_STAFF_ID'
    );

    await queryRunner.dropIndex(
      'account_preferences',
      'IDX_ACCOUNT_PREFERENCES_ACCOUNT_ID'
    );

    // Drop indexes account_preferences_history
    await queryRunner.dropIndex(
      'account_preferences_history',
      'IDX_ACCOUNT_PREFERENCES_HISTORY_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'account_preferences_history',
      'IDX_ACCOUNT_PREFERENCES_HISTORY_STAFF_ID'
    );

    await queryRunner.dropIndex(
      'account_preferences_history',
      'IDX_ACCOUNT_PREFERENCES_HISTORY_ACCOUNT_ID'
    );

    // Drop indexes accounts
    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_INDUSTRY_CATEGORY');

    await queryRunner.dropIndex(
      'accounts',
      'IDX_ACCOUNTS_INDUSTRY_SUBCATEGORY'
    );

    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_STAGE');

    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_SOURCE');

    await queryRunner.dropIndex(
      'accounts',
      'IDX_ACCOUNTS_COLLECTION_OPERATION'
    );

    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_RECRUITER');

    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_TERRITORY');

    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_TENANT_ID');
  }
}
