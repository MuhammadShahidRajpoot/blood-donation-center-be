import { Column, Entity } from 'typeorm';
import { GenericHistoryEntity } from 'src/api/common/entities/generic-history.entity';

@Entity('call_scripts_history')
export class ManageScriptsHistory extends GenericHistoryEntity {
  @Column({
    type: 'text',
  })
  script_type: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  script: string;

  @Column({ type: 'boolean', default: false })
  is_voice_recording: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'bigint', nullable: true })
  tenant_id: bigint;
}
