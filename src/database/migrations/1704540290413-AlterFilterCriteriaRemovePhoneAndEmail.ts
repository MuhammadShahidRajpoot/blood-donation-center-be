import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFilterCriteriaRemovePhoneAndEmail1704540290413
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const entityManager = queryRunner.manager;

    await entityManager
      .createQueryBuilder()
      .delete()
      .from('filter_criteria')
      .where('application_code = :applicationCode', {
        applicationCode: 'staff',
      })
      .andWhere('name IN (:...names)', { names: ['email', 'phone'] })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const entityManager = queryRunner.manager;

    const entriesToInsert = [
      { application_code: 'staff', name: 'email' },
      { application_code: 'staff', name: 'phone' },
    ];

    await entityManager
      .createQueryBuilder()
      .insert()
      .into('filter_criteria')
      .values(entriesToInsert)
      .execute();
  }
}
