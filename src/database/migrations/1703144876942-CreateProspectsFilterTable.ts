import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import genericColumns from '../common/generic-columns';

export class CreateProspectsFilterTable1703144876942
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prospects_filters',
        columns: [
          ...genericColumns,
          {
            name: 'prospect_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'min_projection',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'max_projection',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'eligibility',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'distance',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'organizational_level_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
          {
            name: 'end_date',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
          {
            name: 'location_type',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'prospects_filters',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'prospects_filters',
      new TableForeignKey({
        columnNames: ['prospect_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'prospects',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('prospects_filters', 'created_by');
    await queryRunner.dropForeignKey('prospects_filters', 'prospect_id');
    // Then, drop the table
    await queryRunner.dropTable('prospects_filters');
  }
}
