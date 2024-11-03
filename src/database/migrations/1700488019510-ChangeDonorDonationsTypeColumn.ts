import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class ChangeDonorDonationsTypeColumn1700488019510
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'donors_donations',
      'FK_donors_donations_procedure_id'
    );
    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['donation_type'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_procedure_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('donors_donations', 'FK_procedure_id');
    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['donation_type'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure_types',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_procedure_types_id',
      })
    );
  }
}
