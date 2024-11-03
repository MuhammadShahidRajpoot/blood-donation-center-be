import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('schedule_job_details')
export class ScheduleJobDetails {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  job_title: string;

  @Column({ type: 'text', nullable: false })
  job_description: string;

  @Column({ type: 'boolean', nullable: false })
  is_active: boolean;
}
