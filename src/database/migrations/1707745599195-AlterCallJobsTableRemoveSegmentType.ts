import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export enum segment_type_enum {
  INCLUDE = 'include',
  EXCLUDE = 'exclude',
}

export class AlterCallJobsTableRemoveSegmentType1707745599195
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE call_jobs DROP COLUMN segment_type;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'segment_type',
        type: 'enum',
        enum: Object.values(segment_type_enum),
        isNullable: false,
      })
    );
  }
}
