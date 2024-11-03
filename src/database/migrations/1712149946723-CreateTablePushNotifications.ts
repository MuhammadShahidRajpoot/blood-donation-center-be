import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import GenericColumns from '../common/generic-columns';

export class CreateTablePushNotifications1712149946723
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'push_notifications',
        columns: [
          ...GenericColumns,
          {
            name: 'title',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'organizational_level',
            type: 'bigint[]',
            isNullable: false,
          },
          {
            name: 'module',
            type: 'bigint[]',
            isNullable: false,
          },
          {
            name: 'actionable_link',
            type: 'varchar(255)',
            isNullable: false,
          },

          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'push_notifications',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'push_notifications',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('push_notifications', 'FK_tenant_id');
    await queryRunner.dropForeignKey('push_notifications', 'FK_created_by');
    await queryRunner.dropTable('push_notifications');
  }
}
