import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('webhook_alerts')
export class WebHookAlerts {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  webhookType: string;

  @Column({ type: 'text', nullable: true })
  request_type: string; // General , Other , ? , ?,...

  @Column({ type: 'text', nullable: true })
  api: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Column({ type: 'bigint', nullable: true })
  tenant_id: string;

  @Column({ type: 'boolean', nullable: true })
  success: boolean;
}
