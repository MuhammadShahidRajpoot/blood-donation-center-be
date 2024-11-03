import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSessionDateColumn1704878517647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.sessions ALTER COLUMN "date" TYPE timestamp(6) USING "date"::timestamp(6);'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.sessions ALTER COLUMN "date" TYPE date USING "date"::date;'
    );
  }
}
