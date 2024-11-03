import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AlterCallFlowsEntityTableAddForeignKeyOnCreatedByColumn1707300212853
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'call_flows',
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
    await queryRunner.dropForeignKey('call_flows', 'FK_created_by');
  }
}
