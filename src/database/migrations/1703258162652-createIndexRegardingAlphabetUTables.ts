import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexRegardingAlphabetUTables1703258162652
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // USER
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_USER_HIERARCHY_LEVEL',
        columnNames: ['hierarchy_level'],
      })
    );
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_USER_TENANT',
        columnNames: ['tenant'],
      })
    );
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_USER_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_USER_ROLE',
        columnNames: ['role'],
      })
    );
    // USER
    // USER BUSINESS UNITS
    await queryRunner.createIndex(
      'user_business_units',
      new TableIndex({
        name: 'IDX_USER_BUSINESS_UNITS_USER_ID',
        columnNames: ['user_id'],
      })
    );
    await queryRunner.createIndex(
      'user_business_units',
      new TableIndex({
        name: 'IDX_USER_BUSINESS_UNITS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );
    await queryRunner.createIndex(
      'user_business_units',
      new TableIndex({
        name: 'IDX_USER_BUSINESS_UNITS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // USER BUSINESS UNITS
    // USER EVENTS
    await queryRunner.createIndex(
      'user_events',
      new TableIndex({
        name: 'IDX_USER_EVENTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // USER EVENTS
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // USER
    await queryRunner.dropIndex('user', 'IDX_USER_HIERARCHY_LEVEL');
    await queryRunner.dropIndex('user', 'IDX_USER_TENANT');
    await queryRunner.dropIndex('user', 'IDX_USER_CREATED_BY');
    await queryRunner.dropIndex('user', 'IDX_USER_ROLE');
    // USER
    // USER BUSINESS UNITS
    await queryRunner.dropIndex(
      'user_business_units',
      'IDX_USER_BUSINESS_UNITS_USER_ID'
    );
    await queryRunner.dropIndex(
      'user_business_units',
      'IDX_USER_BUSINESS_UNITS_BUSINESS_UNIT_ID'
    );
    await queryRunner.dropIndex(
      'user_business_units',
      'IDX_USER_BUSINESS_UNITS_CREATED_BY'
    );
    // USER BUSINESS UNITS
    // USER EVENTS
    await queryRunner.dropIndex('user_events', 'IDX_USER_EVENTS_CREATED_BY');
    // USER EVENTS
  }
}
