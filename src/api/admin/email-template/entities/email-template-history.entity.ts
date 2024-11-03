import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericHistoryEntity } from '../../../common/entities/generic-history.entity';
import { templateType } from '../enums/template-type.enum';
import { Tenant } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Entity()
export class EmailTemplateHistory extends GenericHistoryEntity {
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subject: string;

  @Column({
    type: 'text',
    default: templateType.admin,
    nullable: false,
  })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variables: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ nullable: true, type: 'bigint' })
  templateid: bigint;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ nullable: true, type: 'bigint' })
  dailystory_template_id: bigint;

  @Column({ type: 'bigint', nullable: true })
  tenant_id: bigint;
}
