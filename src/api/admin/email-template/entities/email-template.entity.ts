import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { templateType } from '../enums/template-type.enum';
import { Templates } from '../../templates/entities/templates.entity';
import { Tenant } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';

@Entity()
export class EmailTemplate {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: templateType,
    default: templateType.admin,
  })
  type: templateType;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variables: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_archived: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;

  @Column({ nullable: false, default: new Date() })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @Column({ nullable: true, type: 'bigint' })
  templateid: bigint;

  // Relationship with Template entity
  @ManyToOne(() => Templates, (templates) => templates.emailTemplates)
  @JoinColumn({ name: 'templateid' })
  template: Templates;

  @Column({ nullable: true, type: 'bigint' })
  dailystory_template_id: bigint;

  @Column({ nullable: false, type: 'bigint' })
  tenant_id: bigint;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
