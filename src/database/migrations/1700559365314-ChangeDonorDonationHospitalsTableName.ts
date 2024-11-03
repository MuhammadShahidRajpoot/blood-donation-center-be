import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class ChangeDonorDonationHospitalsTableName1700559365314
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'donors_donations_hospital',
      'FK_donors_donations_id'
    );
    await queryRunner.dropForeignKey(
      'donors_donations_hospital',
      'FK_hospitals_id'
    );
    await queryRunner.renameTable(
      'donors_donations_hospital',
      'donors_donations_hospitals'
    );
    await queryRunner.createForeignKey(
      'donors_donations_hospitals',
      new TableForeignKey({
        columnNames: ['donors_donations_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'donors_donations',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_donors_donations_id',
      })
    );
    await queryRunner.createForeignKey(
      'donors_donations_hospitals',
      new TableForeignKey({
        columnNames: ['hospitals_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hospitals',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_hospitals_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'donors_donations_hospitals',
      'FK_donors_donations_id'
    );
    await queryRunner.dropForeignKey(
      'donors_donations_hospitals',
      'FK_hospitals_id'
    );
    await queryRunner.renameTable(
      'donors_donations_hospitals',
      'donors_donations_hospital'
    );
    await queryRunner.createForeignKey(
      'donors_donations_hospital',
      new TableForeignKey({
        columnNames: ['donors_donations_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'donors_donations',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_donors_donations_id',
      })
    );
    await queryRunner.createForeignKey(
      'donors_donations_hospital',
      new TableForeignKey({
        columnNames: ['hospitals_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hospitals',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_hospitals_id',
      })
    );
  }
}
