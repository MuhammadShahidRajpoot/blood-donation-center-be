import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('contamination_alerts')
export class ContaminationAlerts {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  request: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ type: 'text', nullable: true })
  endpoint: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  key_not_found: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_resolved: boolean;
}
