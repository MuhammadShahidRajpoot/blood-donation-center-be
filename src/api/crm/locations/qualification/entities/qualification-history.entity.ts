import { GenericHistoryEntity } from '../../../../common/entities/generic-history.entity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'location_qualifications_history' })
export class QualificationHistory extends GenericHistoryEntity {
  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ nullable: false })
  qualification_date: Date;

  @Column({ nullable: false })
  qualification_expires: Date;

  @Column({ type: 'boolean', default: true })
  qualification_status: boolean;

  @Column({ nullable: true })
  location_id: number;

  @Column({ nullable: true })
  qualified_by: number;

  @Column({ nullable: true, type: 'varchar' })
  attachment_files: string;

  @Column({ nullable: true, type: 'bigint' })
  tenant_id: bigint;
}
