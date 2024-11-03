import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from '../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { HistoryService } from 'src/api/common/services/history.service';
import { DriveContactsDto } from '../dto/drives-contact.dto';
import { DrivesContacts } from '../entities/drive-contacts.entity';
import { DrivesContactsHistory } from '../entities/drive-contacts-history.entity';
import { DrivesHistory } from '../entities/drives-history.entity';
import { Drives } from '../entities/drives.entity';
import { HistoryReason } from 'src/common/enums/history_reason.enum';
import { QueryRunner } from 'typeorm/browser';
import { DriveContact } from '../dto/create-drive.dto';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
dotenv.config();

@Injectable()
export class DriveContactsService extends HistoryService<DrivesContactsHistory> {
  constructor(
    @InjectRepository(DrivesContacts)
    private readonly driveContactsRepository: Repository<DrivesContacts>,
    @InjectRepository(DrivesContactsHistory)
    private readonly drivesContactHistoryRepository: Repository<DrivesContactsHistory>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(DrivesHistory)
    private readonly drivesHistoryRepository: Repository<DrivesHistory>,
    @InjectRepository(AccountContacts)
    private readonly accountContactsRespository: Repository<AccountContacts>
  ) {
    super(drivesContactHistoryRepository);
  }

  async createContacts(
    id: any,
    user: User,
    createContactsDto: DriveContactsDto
  ) {
    try {
      const drive = await this.drivesRepository.findOneBy({
        id,
        is_archived: false,
      });

      if (!drive) {
        return resError(
          "Drive doesn't exist.",
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const deletePromises = [];
      const historyPromises = [];
      let savedDriveContacts: any;
      if (createContactsDto?.deleteContacts?.length > 0) {
        for (const item of createContactsDto.deleteContacts) {
          const where: any = {
            id: item,
            is_archived: false,
          };
          const drive_contact: any = await this.driveContactsRepository.findOne(
            {
              where: where,
              relations: ['created_by', 'drive', 'accounts_contacts', 'role'],
            }
          );
          const drive_contact_history = new DrivesContactsHistory();
          drive_contact_history.history_reason = 'D';
          drive_contact_history.id = drive_contact?.id;
          drive_contact_history.accounts_contacts_id =
            drive_contact?.accounts_contacts?.id;
          drive_contact_history.drive_id = drive_contact?.drive?.id;
          drive_contact_history.role_id = drive_contact?.role?.id;
          drive_contact_history.created_by = user?.id;
          historyPromises.push(this.createHistory(drive_contact_history));

          drive_contact.is_archived = true;
          deletePromises.push(this.driveContactsRepository.save(drive_contact));
        }
        await Promise.all(historyPromises);
        await Promise.all(deletePromises);
        savedDriveContacts = [];
      }
      const promises = [];
      if (createContactsDto?.contacts?.length > 0) {
        for (const element of createContactsDto.contacts) {
          const contact = new DrivesContacts();
          contact.is_archived = false;
          contact.created_by = user;
          contact.drive_id = element?.drive_id || id;
          contact.accounts_contacts_id = element?.accounts_contacts_id;
          contact.role_id = element?.role_id;

          promises.push(this.driveContactsRepository.save(contact));
        }
        savedDriveContacts = await Promise.all(promises);
      }

      // add update drive history
      // await this.drivesHistoryRepository.insert({
      //   ...drive,
      //   history_reason: HistoryReason.C,
      //   created_by: user?.id,
      //   created_at: new Date(),
      // });

      return resSuccess(
        'Contacts Added.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateContacts(id: any, user: User) {
    try {
      const where: any = {
        id: id,
        is_archived: false,
      };
      const drive_contact: any = await this.driveContactsRepository.findOne({
        where: where,
        relations: ['created_by', 'drive', 'accounts_contacts', 'role'],
      });

      if (!drive_contact) {
        return resError(
          `Contact not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      drive_contact.is_archived = true;
      drive_contact.created_at = new Date();
      drive_contact.created_by = user;
      const updatedAccountContact = await this.driveContactsRepository.save(
        drive_contact
      );
      return resSuccess(
        'Deleted Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async saveDriveContacts(
    queryRunner: QueryRunner,
    contacts: Array<DriveContact>,
    drive: Drives,
    created_by: User
  ) {
    const accountContactIds = contacts?.map(
      (item) => item.accounts_contacts_id
    );

    const accountContacts = await this.accountContactsRespository.find({
      where: {
        id: In(accountContactIds),
      },
    });

    for (let i = 0; i < contacts.length; i++) {
      const inputContactItem = contacts[i];
      const contactItem = accountContacts[i];
      const driveContact = new DrivesContacts();
      driveContact.drive = drive;
      driveContact.accounts_contacts_id = inputContactItem.accounts_contacts_id;
      driveContact.created_by = created_by;
      driveContact.role_id = inputContactItem.role_id;
      await queryRunner.manager.save(driveContact);
    }
  }

  async updateDriveContacts(
    queryRunner: QueryRunner,
    contacts: Array<DriveContact>,
    drive: Drives,
    created_by: User
  ) {
    const accountContactIds = contacts?.map(
      (item) => item.accounts_contacts_id
    );

    const accountContacts = await this.accountContactsRespository.find({
      where: {
        id: In(accountContactIds),
      },
    });

    await this.driveContactsRepository.delete({
      drive_id: drive?.id,
    });

    for (let i = 0; i < accountContacts.length; i++) {
      const inputContactItem = contacts[i];
      const contactItem = accountContacts[i];
      const driveContact: any = new DrivesContacts();
      driveContact.id = inputContactItem.accounts_contacts_id;
      driveContact.drive_id = drive?.id;
      driveContact.accounts_contacts = contactItem;
      driveContact.created_by = created_by;
      driveContact.role_id = inputContactItem?.role_id;
      (driveContact.created_at = new Date()),
        (driveContact.created_by = created_by);
      await queryRunner.manager.save(driveContact);
    }
  }
}
