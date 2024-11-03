import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class MenuItems {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ nullable: false, default: true })
  is_protected: boolean;

  @Column({ nullable: false, default: true })
  parent_id: boolean;

  @Column()
  navigation_type: string;

  @Column()
  client_id: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;

  @Column({ nullable: false, default: new Date() })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
