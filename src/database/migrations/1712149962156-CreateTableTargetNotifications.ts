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
  NON_COLLECTION_EVENTS = 'non_collection_events',
}

export class CreateTableTargetNotifications1712149962156
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'target_notifications',
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
            name: 'target_type_id',
            type: 'bigint',
            isNullable: false,
          },

          {
            name: 'target_type',
            type: 'enum',
            enum: Object.values(target_type_enum),
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
      'target_notifications',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'target_notifications',
      new TableForeignKey({
        columnNames: ['push_notification_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'push_notifications',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('target_notifications', 'FK_tenant_id');

    await queryRunner.dropForeignKey(
      'target_notifications',
      'FK_push_notification_id'
    );

    await queryRunner.dropTable('target_notifications');
  }
}
