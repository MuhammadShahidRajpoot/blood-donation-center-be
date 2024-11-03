import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, LessThan, IsNull } from 'typeorm';
import {
  Cron,
  CronExpression,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule';
import { Donors } from '../entities/donors.entity';
import moment from 'moment';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from '../../common/entities/contacts.entity';
import { DonorsHistory } from '../entities/donors-history.entity';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { AddressService } from '../../common/address.service';
import { ContactsService } from '../../common/contacts.service';
import { pagination } from 'src/common/utils/pagination';
import { BBCSDonorType } from '../enum/bbcs-donor-type.enum';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactTypeEnum } from '../../common/enums';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { getTenantConfig } from 'src/api/common/utils/tenantConfig';
import { timeout } from 'rxjs';
import e from 'express';
const LIMIT = 30;
@Injectable()
export class BBCSDataSync {
  constructor(
    @InjectRepository(Donors)
    private readonly DonorsRepository: Repository<Donors>,

    private readonly entityManager: EntityManager,
    @InjectRepository(Donors)
    private entityRepository: Repository<Donors>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Contacts)
    private contactsRepository: Repository<Contacts>,
    @InjectRepository(DonorsHistory)
    private readonly entityHistoryRepository: Repository<DonorsHistory>,
    @InjectRepository(TenantConfigurationDetail)
    private readonly tenantConfigRepository: Repository<TenantConfigurationDetail>,
    private readonly BBCSConnectorService: BBCSConnector,
    private readonly addressService: AddressService,
    private readonly contactsService: ContactsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}
  //   @Cron(CronExpression.EVERY_10_HOURS)
  @Cron(CronExpression.EVERY_QUARTER) //
  async triggerBBCSDonorsSync() {
    let PAGE = 1;
    try {
      console.log(
        'CRON: BBCS Donors Sync  - Job Started _______________________________',
        moment().format()
      );
      while (true) {
        const { skip, take } = pagination(PAGE, LIMIT);
        console.log({ take, skip });
        let donors: Donors[];
        try {
          donors = await this.DonorsRepository.find({
            where: {
              is_synced: false,
              external_id: IsNull(),
            },
            relations: {
              tenant_id: true,
              created_by: true,
            },
            skip,
            take,
          });
          PAGE++;
          console.log(donors.map((e) => e.id).sort());
          if (donors.length < 1) break;
        } catch (e) {
          console.log(
            `Error Processing Donor batch having offset: ${skip} and limit: ${take}`
          );
        }
        const promises = [];
        if (donors)
          for (const donor of donors) {
            promises.push(this.processDonor(donor));
          }
        await Promise.allSettled(promises);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  }
  async processDonor(donor: Donors) {
    console.log(donor.tenant_id);
    const tenantConfig = await getTenantConfig(
      this.tenantConfigRepository,
      donor.tenant.id
    );
    const contacts = await this.contactsRepository.find({
      where: {
        contactable_id: donor.id,
        contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
      },
    });
    const address = await this.addressRepository.findOne({
      where: {
        addressable_id: donor.id,
        addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
      },
    });
    const bbcsQuery = await this.BBCSConnectorService.findDonorBBCS(
      {
        firstName: donor.first_name,
        lastNames: donor.last_name,
        birthDate: moment(donor.birth_date).format('yyyy-MM-DD'),
        email: contacts.find(
          (e) => e.is_primary && [4, 5, 6].includes(e.contact_type)
        )?.data,
        limit: 100,
      },
      tenantConfig
    );
    if (bbcsQuery.type === BBCSDonorType.NOMATCH) {
      let uuid;
      try {
        uuid = await this.BBCSConnectorService.createDonorBBCS(
          {
            firstName: donor.first_name,
            lastName: donor.last_name,
            birthDate: moment(donor.birth_date).format('yyyy-MM-DD'),
            gender: donor?.gender || '',
            addressLineOne: address?.address1 || '',
            addressLineTwo: address?.address2 || '',
            city: address?.city || '',
            zipCode: address?.zip_code,
            homePhone: contacts
              .find((c) => c?.contact_type === 3)
              ?.data?.replace(/[^\d]/g, ''),
            workPhone: contacts
              .find((c) => c?.contact_type === 1)
              ?.data?.replace(/[^\d]/g, ''),
            email: contacts.find(
              (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
            )?.data,
            cellPhone: contacts
              .find((c) => c?.contact_type === 2)
              ?.data?.replace(/[^\d]/g, ''),

            user: donor.created_by.id,
            state: address?.short_state,
          },
          tenantConfig
        );
        donor.is_synced = true;
        donor.external_id = uuid;
      } catch (e) {
        donor.is_synced = false;
        donor.bbcs_donor_type = bbcsQuery.type;
        console.log(e.message);
      } finally {
        await this.DonorsRepository.save(donor);
        console.log({ id: donor.id, uuid });
      }
    } else if (bbcsQuery.type === 'EXACT') {
      console.log('heheheehehhehehehehehehehheheheh');
      const bbcsDonor = bbcsQuery.data[0];
      console.log(bbcsDonor);
      await this.BBCSConnectorService.donorAddressUpdateBBCS(
        {
          city: address.city,
          addressLineOne: address.address1,
          zipCode: address.zip_code,
          uuid: bbcsDonor.UUID,
          addressLineTwo: address.address2,
          user: donor.created_by.id,
        },
        tenantConfig
      );
      if (contacts.find((c) => c.contact_type === ContactTypeEnum.WORK_PHONE))
        await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
          {
            homePhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
            )?.data,
            uuid: bbcsDonor.UUID,
            email: contacts.find(
              (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
            )?.data,
            user: donor.created_by.id,
            workPhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
            )?.data,
            cellPhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
            )?.data,
          },
          'workPhone',
          tenantConfig
        );
      if (contacts.find((c) => c.contact_type === ContactTypeEnum.OTHER_PHONE))
        await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
          {
            homePhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
            )?.data,
            uuid: bbcsDonor.UUID,
            email: contacts.find(
              (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
            )?.data,
            user: donor.created_by.id,
            workPhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
            )?.data,
            cellPhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
            )?.data,
          },
          'homePhone',
          tenantConfig
        );
      if (contacts.find((c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE))
        await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
          {
            homePhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
            )?.data,
            uuid: bbcsDonor.UUID,
            email: contacts.find(
              (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
            )?.data,
            user: donor.created_by.id,
            workPhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
            )?.data,
            cellPhone: contacts.find(
              (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
            )?.data,
          },
          'cellPhone',
          tenantConfig
        );
      donor.external_id = bbcsDonor.UUID;
      donor.is_synced = true;
      donor.bbcs_donor_type = BBCSDonorType.EXACT;
      await this.DonorsRepository.save(donor);
    } else {
      donor.bbcs_donor_type = bbcsQuery.type;
      await this.DonorsRepository.save(donor);
    }
  }
}
