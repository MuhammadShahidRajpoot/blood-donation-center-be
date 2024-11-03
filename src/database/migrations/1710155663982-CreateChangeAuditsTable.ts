import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';

export class CreateChangeAuditsTable1710155663982
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'change_audits',
        columns: [
          ...genericColumns,
          { name: 'changes_from', type: 'varchar', isNullable: true },
          {
            name: 'changes_to',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'changes_field',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'changed_when',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'auditable_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'auditable_type',
            type: 'varchar',
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
      'change_audits',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'change_audits',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user', 'FK_tenant_id');
    await queryRunner.dropForeignKey('user', 'FK_created_by');
    await queryRunner.dropTable('change_audits');
  }
}
