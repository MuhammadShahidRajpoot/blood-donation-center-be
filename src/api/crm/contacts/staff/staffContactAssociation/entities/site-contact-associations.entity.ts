import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { CRMVolunteer } from '../../../volunteer/entities/crm-volunteer.entity';

@Entity()
export class SiteContactAssociations extends GenericEntity {
  @ManyToOne(() => CrmLocations, (location) => location.id, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location_id: CrmLocations;

  @ManyToOne(() => CRMVolunteer, (volunteer) => volunteer.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer_id: CRMVolunteer;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  closeout_date: Date;
}
