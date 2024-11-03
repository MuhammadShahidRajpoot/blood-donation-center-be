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

@Entity()
export class SegmentsContactsHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'varchar', length: 1, nullable: false })
  historyReason: string;

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

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'bigint', nullable: false })
  created_by: bigint;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
