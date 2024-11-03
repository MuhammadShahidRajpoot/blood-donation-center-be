import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGenericAttachmentFileTable1706692201328
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'generic_attachments_files',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'attachment_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'attachment_path',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'attachment_name',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['created_by'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('generic_attachments_files');
  }
}
