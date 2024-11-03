import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { FavoriteLocationTypeEnum } from '../../manage-favorites/enum/manage-favorites.enum';
import { Prospects } from './prospects.entity';

@Entity('prospects_filters')
export class ProspectsFilters extends GenericEntity {
  @ManyToOne(() => Prospects, (prospect) => prospect.id, { nullable: false })
  @JoinColumn({ name: 'prospect_id' })
  prospect_id: Prospects;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: false,
  })
  start_date?: Date;

  @Column({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true,
  })
  end_date?: Date;

  @Column({ type: 'int', nullable: false })
  min_projection?: number;

  @Column({ type: 'int', nullable: false })
  max_projection?: number;

  @Column({ type: 'int', nullable: false })
  eligibility?: number;

  @Column({ type: 'int', nullable: false })
  distance?: number;

  @Column({ type: 'int', array: true, nullable: false })
  organizational_level_id?: number[];

  @Column({
    type: 'enum',
    enum: FavoriteLocationTypeEnum,
  })
  location_type?: FavoriteLocationTypeEnum;
}
