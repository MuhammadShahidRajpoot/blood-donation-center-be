import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColumnvehicleAssignmentTable1706185661943
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles_assignments', 'split_shift');
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
