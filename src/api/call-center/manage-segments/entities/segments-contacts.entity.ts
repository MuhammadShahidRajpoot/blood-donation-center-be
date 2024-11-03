import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Segments } from './segments.entity';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { call_status } from 'src/api/common/enums/call-center.enums';
import { CallOutcomes } from 'src/api/system-configuration/tenants-administration/call-outcomes/entities/call-outcomes.entity';

@Entity()
export class SegmentsContacts {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'bigint', nullable: false })
  ds_segment_id: bigint;

  @ManyToOne(() => Segments, { nullable: false })
  @JoinColumn({ name: 'ds_segment_id' })
  dsSegment: Segments;

  @Column({ type: 'bigint', nullable: false })
  contact_id: bigint;

  @ManyToOne(() => Contacts, { nullable: false })
  @JoinColumn({ name: 'contact_id' })
  contact: Contacts;

  @Column({ name: 'dsid', type: 'varchar', length: 255, nullable: false })
  dsid: string;

  @Column({ type: 'bigint', nullable: true })
  call_outcome_id: bigint;

  @ManyToOne(() => CallOutcomes, { nullable: true })
  @JoinColumn({ name: 'call_outcome_id' })
  callOutcome: CallOutcomes;

  @Column({ type: 'enum', enum: call_status })
  call_status: call_status;

  @Column({ type: 'varchar', length: 15, nullable: true })
  queue_time: string;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'bigint', nullable: false })
  created_by: bigint;

  @Column({ type: 'bigint', nullable: false })
  no_of_retry: bigint;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
