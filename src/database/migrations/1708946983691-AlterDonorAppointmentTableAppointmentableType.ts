import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDonorAppointmentTableAppointmentableType1708946983691
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(
        `ALTER TABLE public.donors_appointments ALTER COLUMN appointmentable_type TYPE varchar(255) USING appointmentable_type::varchar(255);`
      ),
      queryRunner.query(
        `ALTER TABLE public.donors_appointments_history ALTER COLUMN appointmentable_type TYPE varchar(255) USING appointmentable_type::varchar(255);`
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(
        `ALTER TABLE public.donors_appointments ALTER COLUMN appointmentable_type TYPE public.donors_appointments_appointmentable_type_enum USING appointmentable_type::text::public.donors_appointments_appointmentable_type_enum;`
      ),
      queryRunner.query(
        `ALTER TABLE public.donors_appointments_history ALTER COLUMN appointmentable_type TYPE public.donors_appointments_appointmentable_type_enum USING appointmentable_type::text::public.donors_appointments_appointmentable_type_enum;`
      ),
    ]);
  }
}
