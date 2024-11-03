import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from 'src/api/common/entities/generic.entity';
import { DonorDonations } from './donor-donations.entity';
import { Hospitals } from './hospitals.entity';

@Entity('donors_donations_hospitals')
export class DonorDonationsHospitals extends GenericEntity {
  @ManyToOne(() => DonorDonations, (donor_donation) => donor_donation.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'donors_donations_id' })
  donors_donations_id: DonorDonations;

  @Column({ type: 'timestamp', nullable: true })
  date_shipped: Date;

  @ManyToOne(() => Hospitals, (hospital) => hospital.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'hospitals_id' })
  hospitals_id: Hospitals;
}
