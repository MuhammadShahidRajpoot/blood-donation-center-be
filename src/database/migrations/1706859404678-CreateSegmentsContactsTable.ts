import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateSegmentsContactsTable1706859404678
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'segments_contacts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'ds_segment_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'contact_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'dsid',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'call_outcome_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'call_status',
            type: 'enum',
            enum: ['1', '2', '3'],
            isNullable: false,
            default: "'1'",
          },
          {
            name: 'queue_time',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'segments_contacts',
      new TableForeignKey({
        columnNames: ['ds_segment_id'],
        referencedColumnNames: ['ds_segment_id'],
        referencedTableName: 'segments',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'segments_contacts',
      new TableForeignKey({
        columnNames: ['contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contacts',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'segments_contacts',
      new TableForeignKey({
        columnNames: ['call_outcome_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_outcomes',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'segments_contacts',
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
    await queryRunner.dropTable('segments_contacts');
  }
}
