import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import GenericColumns from '../common/generic-columns';

export enum target_type_enum {
  USERS = 'users', // if required approval
  ROLES = 'roles',
  DRIVES = 'drives', // if does not requires approval or it is approve
  SESSIONS = 'sessions',
  NCE = 'non_collection_events',
}

export class CreateTableUserNotifications1712149991975
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_notifications',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'push_notification_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_read',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'user_notifications',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'user_notifications',
      new TableForeignKey({
        columnNames: ['push_notification_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'push_notifications',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'user_notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_notifications', 'FK_tenant_id');

    await queryRunner.dropForeignKey(
      'user_notifications',
      'FK_push_notification_id'
    );

    await queryRunner.dropForeignKey('user_notifications', 'FK_user_id');
    await queryRunner.dropTable('user_notifications');
  }
}
