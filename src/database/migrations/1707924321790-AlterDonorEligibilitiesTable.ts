import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterDonorEligibilitiesTable1707924321790
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'donors_eligibilities',
      new TableForeignKey({
        columnNames: ['donation_type'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'donors_eligibilities',
      new TableForeignKey({
        columnNames: ['donation_type'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure_types',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'donors_eligibilities',
      new TableForeignKey({
        columnNames: ['donation_type'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure_types',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'donors_eligibilities',
      new TableForeignKey({
        columnNames: ['donation_type'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }
}
