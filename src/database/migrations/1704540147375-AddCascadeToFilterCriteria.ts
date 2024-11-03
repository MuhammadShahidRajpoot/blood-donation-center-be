import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddCascadeToFilterCriteria1704540147375
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'filter_saved_criteria',
      'FK_2781cbec37daa7b43fbdf7f5ee0'
    );

    await queryRunner.createForeignKey(
      'filter_saved_criteria',
      new TableForeignKey({
        columnNames: ['filter_criteria_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'filter_criteria',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'filter_saved_criteria',
      'FK_2781cbec37daa7b43fbdf7f5ee0'
    );

    await queryRunner.createForeignKey(
      'filter_saved_criteria',
      new TableForeignKey({
        columnNames: ['filter_criteria_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'filter_criteria',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_filter_criteria',
      })
    );
  }
}
