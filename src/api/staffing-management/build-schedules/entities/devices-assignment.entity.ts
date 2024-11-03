import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'devices_assignments' })
export class DeviceAssignments {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

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

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ type: 'bigint', nullable: false })
  tenant_id: bigint;
}
