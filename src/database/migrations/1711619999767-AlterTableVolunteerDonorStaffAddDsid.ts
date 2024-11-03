import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableVolunteerDonorStaffAddDsid1711619999767
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'crm_volunteer',
      new TableColumn({
        name: 'dsid',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'dsid',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'staff',
      new TableColumn({
        name: 'dsid',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'crm_volunteer_history',
      new TableColumn({
        name: 'dsid',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'donors_history',
      new TableColumn({
        name: 'dsid',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'staff_history',
      new TableColumn({
        name: 'dsid',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('crm_volunteer', 'dsid');
    await queryRunner.dropColumn('donors', 'dsid');
    await queryRunner.dropColumn('staff', 'dsid');
    await queryRunner.dropColumn('crm_volunteer_history', 'dsid');
    await queryRunner.dropColumn('donors_history', 'dsid');
    await queryRunner.dropColumn('staff_history', 'dsid');
  }
}
