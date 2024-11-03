import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { AccountPreferences } from '../entities/account-preferences.entity';
import { AccountPreferencesDto } from '../dto/account-preferences.dto';
import { AccountPreferencesHistory } from '../entities/account-preferences-history.entity';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
dotenv.config();

@Injectable()
export class AccountPreferencesService extends HistoryService<AccountPreferencesHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Accounts)
    private readonly accountRepository: Repository<Accounts>,
    @InjectRepository(AccountPreferences)
    private readonly accountPreferencesRepository: Repository<AccountPreferences>,
    @InjectRepository(AccountPreferencesHistory)
    private readonly accountsPreferencesHistoryRepository: Repository<AccountPreferencesHistory>
  ) {
    super(accountsPreferencesHistoryRepository);
  }

  async createPreferences(
    id: any,
    user: User,
    createPreferencesDto: AccountPreferencesDto
  ) {
    try {
      const accountData = await this.accountRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!accountData) {
        return resError(
          `Account not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const deletePromises = [];
      const historyPromises = [];
      let savedAccountPreferences: any;
      if (createPreferencesDto.deleteStaff.length > 0) {
        for (const item of createPreferencesDto.deleteStaff) {
          const where: any = {
            id: item,
            is_archived: false,
          };
          const account_preference: any =
            await this.accountPreferencesRepository.findOne({
              where: where,
              relations: ['created_by', 'tenant', 'staff_id', 'account_id'],
            });

          account_preference.is_archived = true;
          deletePromises.push(
            this.accountPreferencesRepository.save(account_preference)
          );
        }
        await Promise.all(deletePromises);
        savedAccountPreferences = [];
      }
      const promises = [];
      if (createPreferencesDto.allStaff.length > 0) {
        for (const element of createPreferencesDto.allStaff) {
          const preference = new AccountPreferences();
          preference.is_archived = false;
          preference.created_by = user;
          preference.account_id = id;
          preference.is_active = true;
          preference.preference = element?.preference;
          preference.staff_id = element?.staff_id;
          preference.tenant_id = user?.tenant?.id;
          const data = await this.accountPreferencesRepository.save(preference);
          delete data?.created_by;
          promises.push(data);
        }
        savedAccountPreferences = await Promise.all(promises);
      }
      return resSuccess(
        'Preferences Added.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedAccountPreferences
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async archivePreferences(id: any, user: User) {
    try {
      const where: any = {
        id: id,
        is_archived: false,
      };
      const account_preference: any =
        await this.accountPreferencesRepository.findOne({
          where: where,
          relations: ['created_by', 'tenant', 'staff_id', 'account_id'],
        });
      if (account_preference) {
        account_preference.is_archived = true;
        account_preference.created_at = new Date();
        account_preference.created_by = this.request?.user;
        await this.accountPreferencesRepository.save(account_preference);
      }
      return resSuccess(
        'Preference removed successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findAllPreferences(id: any) {
    try {
      const where: any = {
        is_archived: false,
        account_id: { id: id },
      };
      where.staff_id = { is_active: true };

      const response = await this.accountPreferencesRepository.find({
        where: where,
        relations: ['created_by', 'tenant', 'staff_id', 'account_id'],
      });
      return {
        status: HttpStatus.OK,
        response: 'Preferences Fetched',
        data: response,
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
