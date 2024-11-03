import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterGeneralAttachmentsFilesAddedTenantId1713193359711
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM generic_attachments_files;');
    await queryRunner.addColumn(
      'generic_attachments_files',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: false,
      })
    );

    await queryRunner.createForeignKey(
      'generic_attachments_files',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'CASCADE',
        name: 'FK_tenant_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'generic_attachments_files',
      'FK_tenant_id'
    );
    await queryRunner.dropColumn('generic_attachments_files', 'tenant_id');
  }
}
