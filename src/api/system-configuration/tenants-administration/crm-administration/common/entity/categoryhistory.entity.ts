import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { typeEnum } from '../enums/type.enum';

@Entity({ name: 'category_history' })
export class CategoryHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  rowkey: bigint;

  @Column({ type: 'bigint' })
  id: bigint;

  @Column({ nullable: true })
  history_reason?: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  type: string;

  @Column({ default: false, nullable: false })
  is_archived: boolean;

  @Column({ type: 'bigint', nullable: true })
  parent_id: bigint;

  @Column({ nullable: false, default: new Date() })
  created_at: Date;

  @Column({ type: 'bigint' })
  created_by: number;

  @Column({ nullable: false })
  tenant_id: number;
}
