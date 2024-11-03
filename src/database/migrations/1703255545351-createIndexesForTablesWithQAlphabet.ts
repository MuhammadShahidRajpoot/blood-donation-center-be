import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithQAlphabet1703255545351
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indexes for Qualification table
    await queryRunner.createIndex(
      'qualifications',
      new TableIndex({
        name: 'IDX_QUALIFICATIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index for Qualification table
    await queryRunner.dropIndex(
      'qualifications',
      'IDX_QUALIFICATIONS_CREATED_BY'
    );
  }
}
