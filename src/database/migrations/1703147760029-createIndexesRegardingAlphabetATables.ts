import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesRegardingAlphabetATables1703147760029
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Address Table
    await queryRunner.createIndex(
      'address',
      new TableIndex({
        name: 'IDX_ADDRESS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'address',
      new TableIndex({
        name: 'IDX_ADDRESS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Ads Table
    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Affiliation Table
    await queryRunner.createIndex(
      'affiliation',
      new TableIndex({
        name: 'IDX_AFFILIATION_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'affiliation',
      new TableIndex({
        name: 'IDX_AFFILIATION_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Alias Table
    await queryRunner.createIndex(
      'alias',
      new TableIndex({
        name: 'IDX_ALIAS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Approval Table
    await queryRunner.createIndex(
      'approval',
      new TableIndex({
        name: 'IDX_APPROVAL_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'approval',
      new TableIndex({
        name: 'IDX_APPROVAL_CREATED_BY',
        columnNames: ['created_by_id'],
      })
    );

    // Assertion Codes Table
    await queryRunner.createIndex(
      'assertion_codes',
      new TableIndex({
        name: 'IDX_ASSERTION_CODES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Attachments File Table
    await queryRunner.createIndex(
      'attachments_files',
      new TableIndex({
        name: 'IDX_ATTACHMENTS_FILES_ATTACHMENT_ID',
        columnNames: ['attachment_id'],
      })
    );

    await queryRunner.createIndex(
      'attachments_files',
      new TableIndex({
        name: 'IDX_ATTACHMENTS_FILES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Audit Fields Table
    await queryRunner.createIndex(
      'audit_fields',
      new TableIndex({
        name: 'IDX_AUDIT_FIELDS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'audit_fields',
      new TableIndex({
        name: 'IDX_AUDIT_FIELDS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Address Table
    await queryRunner.dropIndex('address', 'IDX_ADDRESS_TENANT_ID');

    await queryRunner.dropIndex('address', 'IDX_ADDRESS_CREATED_BY');

    // Ads Table
    await queryRunner.dropIndex('ads', 'IDX_ADS_TENANT_ID');

    await queryRunner.dropIndex('ads', 'IDX_ADS_CREATED_BY');

    // Affiliation Table
    await queryRunner.dropIndex('affiliation', 'IDX_AFFILIATION_TENANT_ID');

    await queryRunner.dropIndex('adaffiliations', 'IDX_AFFILIATION_CREATED_BY');

    // Alias Table
    await queryRunner.dropIndex('alias', 'IDX_ALIAS_TENANT_ID');

    // Approval Table
    await queryRunner.dropIndex('approval', 'IDX_APPROVAL_TENANT_ID');

    await queryRunner.dropIndex('approval', 'IDX_APPROVAL_CREATED_BY');

    // Assertion Codes
    await queryRunner.dropIndex(
      'assertion_codes',
      'IDX_ASSERTION_CODES_TENANT_ID'
    );

    // Attachments File Table
    await queryRunner.dropIndex(
      'attachments_files',
      'IDX_ATTACHMENTS_FILES_ATTACHMENT_ID'
    );

    await queryRunner.dropIndex(
      'attachments_files',
      'IDX_ATTACHMENTS_FILES_CREATED_BY'
    );

    // Audit Fields Table
    await queryRunner.dropIndex('audit_fields', 'IDX_AUDIT_FIELDS_TENANT_ID');

    await queryRunner.dropIndex('audit_fields', 'IDX_AUDIT_FIELDS_CREATED_BY');
  }
}
