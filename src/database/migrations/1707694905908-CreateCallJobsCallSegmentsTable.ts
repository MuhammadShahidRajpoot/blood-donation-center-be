import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import genericColumns from '../common/generic-columns';

export enum segment_type_enum {
  INCLUDE = 'include',
  EXCLUDE = 'exclude',
}

export class CreateCallJobsCallSegmentsTable1707694905908
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_call_segments',
        columns: [
          ...genericColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'segment_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'segment_type',
            type: 'enum',
            enum: Object.values(segment_type_enum),
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'call_jobs_call_segments',
      new TableForeignKey({
        columnNames: ['call_job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_jobs',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs_call_segments',
      new TableForeignKey({
        columnNames: ['segment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'segments',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs_call_segments',
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
    await queryRunner.dropForeignKey(
      'call_jobs_call_segments',
      'FK_call_job_id'
    );

    await queryRunner.dropForeignKey(
      'call_jobs_call_segments',
      'FK_segment_id'
    );

    await queryRunner.dropForeignKey(
      'call_jobs_call_segments',
      'FK_created_by'
    );

    await queryRunner.dropTable('call_jobs_call_segments');
  }
}
