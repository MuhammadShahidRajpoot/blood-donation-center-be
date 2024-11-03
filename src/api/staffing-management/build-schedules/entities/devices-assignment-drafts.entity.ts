import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeviceAssignments } from './devices-assignment.entity';

@Entity({ name: 'devices_assignments_drafts' })
export class DeviceAssignmentsDrafts {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ManyToOne(
    () => DeviceAssignments,
    (devicesAssignments) => devicesAssignments.id,
    { nullable: true }
  )
  @JoinColumn({ name: 'device_assignment_id' })
  devices_assignment_id: bigint;

  @Column({ nullable: false })
  reason: string;

  @Column({ type: 'bigint', nullable: true })
  operation_id: bigint;

  @Column({ nullable: true })
  operation_type: string;

  @Column({ nullable: true })
  is_additional: boolean;

  @Column({ nullable: true })
  pending_assignment: boolean;

  @Column({ type: 'bigint', nullable: true })
  shift_id: bigint;

  @Column({ type: 'int', nullable: true })
  requested_device_type_id: number;

  @Column({ type: 'bigint', nullable: true })
  assigned_device_id: bigint;

  @Column({ type: 'bigint', nullable: true })
  reassign_by: bigint;

  @Column({ nullable: true })
  is_notify: boolean;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;
}
