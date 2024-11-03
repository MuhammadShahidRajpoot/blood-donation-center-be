import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, IsNull, LessThan, Repository, In } from 'typeorm';
import { Accounts } from '../entities/accounts.entity';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from '../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { HistoryService } from 'src/api/common/services/history.service';
import { AccountContactsDto } from '../dto/accounts-contact.dto';
import { AccountContacts } from '../entities/accounts-contacts.entity';
import { AccountContactsHistory } from '../entities/accounts-contacts-history.entity';
import { GetAllAccountContactsInterface } from '../interface/account-contacts.interface';
import moment from 'moment';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { DrivesContacts } from 'src/api/operations-center/operations/drives/entities/drive-contacts.entity';
import { Contacts } from '../../contacts/common/entities/contacts.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
dotenv.config();

@Injectable()
export class AccountContactsService extends HistoryService<AccountContactsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Accounts)
    private readonly accountRepository: Repository<Accounts>,
    @InjectRepository(DrivesContacts)
    private readonly drivesContactsRepo: Repository<DrivesContacts>,
    @InjectRepository(AccountContacts)
    private readonly accountContactsRepository: Repository<AccountContacts>,
    @InjectRepository(AccountContactsHistory)
    private readonly accountsContactHistoryRepository: Repository<AccountContactsHistory>,
    @InjectRepository(Contacts)
    private readonly ContactsRepository: Repository<Contacts>
  ) {
    super(accountsContactHistoryRepository);
  }

  async createContacts(
    id: any,
    user: User,
    createContactsDto: AccountContactsDto
  ) {
    try {
      const deletePromises = [];
      const historyPromises = [];
      let savedAccountContacts: any;
      if (createContactsDto?.deleteContacts?.length > 0) {
        const inUse = await this.drivesContactsRepo.find({
          where: {
            accounts_contacts: {
              id: In(createContactsDto?.deleteContacts),
            },
            is_archived: false,
          },
        });

        if (inUse?.length)
          return resError(
            'Currently in use by drive',
            'currently_in_use',
            HttpStatus.BAD_REQUEST
          );
      }

      if (createContactsDto?.deleteContacts?.length > 0) {
        for (const item of createContactsDto.deleteContacts) {
          const where: any = {
            id: item,
            is_archived: false,
          };
          const account_contact: any =
            await this.accountContactsRepository.findOne({
              where: where,
              relations: ['created_by', 'contactable_id', 'record', 'role_id'],
            });

          account_contact.is_archived = true;
          deletePromises.push(
            this.accountContactsRepository.save(account_contact)
          );
        }
        await Promise.all(deletePromises);
        savedAccountContacts = [];
      }
      const promises = [];
      if (createContactsDto?.contacts?.length > 0) {
        for (const element of createContactsDto.contacts as any) {
          const contact = new AccountContacts();
          contact.is_archived = false;
          contact.created_by = user;
          contact.contactable_type = element?.contactable_type;
          contact.contactable_id = id;
          contact.record_id = element?.record;
          contact.role_id = element?.role_id;

          promises.push(this.accountContactsRepository.save(contact));
        }
        savedAccountContacts = await Promise.all(promises);
      }

      const result = savedAccountContacts?.map((element) => {
        const { created_by, ...rest } = element;
        return {
          ...rest,
          tenant_id: this.request.user?.tenant?.id,
        };
      });
      return resSuccess(
        'Contacts Added.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        result
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async updateContacts(
    id: any,
    user: User,
    createContactsDto: AccountContactsDto
  ) {
    try {
      const where: any = {
        id: id,
        is_archived: false,
      };
      const account_contact: any = await this.accountContactsRepository.findOne(
        {
          where: where,
          relations: ['created_by', 'contactable_id', 'record', 'role_id'],
        }
      );

      if (!account_contact) {
        return resError(
          `Contact not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      account_contact.closeout_date = createContactsDto.closeout_date;
      account_contact.created_at = new Date();
      account_contact.created_by = this.request?.user;

      const updatedAccountContact = await this.accountContactsRepository.save(
        account_contact
      );
      return resSuccess(
        'Closeout Date Added.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findAllContacts(
    id: any,
    getAllAccountContactsInterface: GetAllAccountContactsInterface
  ) {
    try {
      const is_current = getAllAccountContactsInterface.is_current === 'true';

      const where: any = [
        {
          is_archived: false,
          contactable_id: { id: id },
          closeout_date: is_current
            ? MoreThanOrEqual(moment().format('YYYY-MM-DD')) || IsNull()
            : LessThan(moment().format('YYYY-MM-DD')),
        },
        {
          is_archived: false,
          contactable_id: { id: id },
          closeout_date: is_current
            ? IsNull()
            : LessThan(moment().format('YYYY-MM-DD')),
        },
      ];

      const response = await this.accountContactsRepository.find({
        where: where,
        relations: ['created_by', 'contactable_id', 'record', 'role_id'],
        order: { id: 'ASC' },
      });

      for (let res of response as any) {
        const find_data = await this.ContactsRepository.find({
          where: {
            contactable_id: res?.record?.id,
            contactable_type: 'crm_volunteer',
            is_primary: true,
            is_archived: false,
          },
          relations: ['tenant'],
        });

        res.record.contact = find_data;
      }

      const modifiedResponse = response.map((item: any) => {
        const tenantId = item.contactable_id
          ? item?.contactable_id?.tenant_id
          : null;
        return Object.assign(item, { tenant_id: tenantId });
      });

      return {
        status: HttpStatus.OK,
        response: 'Contacts Fetched ',
        data: modifiedResponse,
      };
    } catch (e) {
      console.log(e);
      return resError(
        `Internel Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
