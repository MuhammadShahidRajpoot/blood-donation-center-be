import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import GenericColumns from '../common/generic-columns';

export class CreateSiteContactAssociations1704054145047
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create table
    await queryRunner.createTable(
      new Table({
        name: 'site_contact_associations',
        columns: [
          ...GenericColumns,
          {
            name: 'location_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'volunteer_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'closeout_date',
            type: 'date',
            isNullable: true,
          },
        ],
      }),
      true // set `true` to create the table if it doesn't exist);
    );

    await queryRunner.createForeignKey(
      'site_contact_associations',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'site_contact_associations',
      new TableForeignKey({
        columnNames: ['location_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'crm_locations',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'site_contact_associations',
      new TableForeignKey({
        columnNames: ['volunteer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'crm_volunteer',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'site_contact_associations',
      'FK_created_by'
    );
    await queryRunner.dropForeignKey(
      'site_contact_associations',
      'FK_location_id'
    );
    await queryRunner.dropForeignKey(
      'site_contact_associations',
      'FK_volunteer_id'
    );

    await queryRunner.dropTable('site_contact_associations');
  }
}
