import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterDonorsDonationsHospitalsTable1700490839498
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donors_donations_hospital', 'location');
    
    await queryRunner.clearTable('donors_donations_hospital');

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
    await queryRunner.changeColumn(
      'donors_donations_hospital',
      'hospital',
      new TableColumn({
        name: 'hospitals_id',
        type: 'bigint',
        isNullable: false,
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors_donations_hospital',
      new TableColumn({
        name: 'location',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );
    await queryRunner.dropForeignKey(
      'donors_donations_hospital',
      'FK_donors_donations_id'
    );
    await queryRunner.changeColumn(
      'donors_donations_hospital',
      'hospitals_id',
      new TableColumn({
        name: 'hospital',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );
    await queryRunner.dropForeignKey(
      'donors_donations_hospital',
      'FK_hospitals_id'
    );
  }
}
