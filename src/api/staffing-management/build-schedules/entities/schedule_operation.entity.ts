import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ScheduleOperation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'bigint', nullable: true })
  operation_id: bigint;

  @Column({})
  operation_type: string;

  @Column({ type: 'bigint', nullable: true })
  schedule_id: bigint;

  @Column({ nullable: true })
  pending_assignment: boolean;

  @Column({ nullable: true })
  in_sync: boolean;

  @Column({ nullable: true })
  to_be_removed: boolean;

  @Column({ nullable: true })
  is_paused_at: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
