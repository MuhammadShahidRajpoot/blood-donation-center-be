import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('becs_races')
export class BecsRaces {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;

  @Column({ type: 'bigint', nullable: false })
  becs_system: bigint;

  @Column({ type: 'varchar', length: 30, nullable: false })
  becs_code: string;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;
}