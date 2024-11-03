import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCreateAtTimeStampOfRolesTable1704888389917
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE roles ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp with time zone`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE roles ALTER COLUMN created_at TYPE timestamp without time zone USING created_at::timestamp without time zone`
    );
  }
}
