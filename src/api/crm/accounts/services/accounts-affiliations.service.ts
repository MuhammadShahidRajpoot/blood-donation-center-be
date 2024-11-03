import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
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
import { AccountAffiliations } from '../entities/account-affiliations.entity';
import { AccountAffiliationsDto } from '../dto/account-affiliations.dto';
import { AccountAffilitaionsHistory } from '../entities/account-affiliations-history.entity';
import { GetAllAccountAffiliationsInterface } from '../interface/account-affiliations.interface';
import moment from 'moment';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
dotenv.config();

@Injectable()
export class AccountAffiliationsService extends HistoryService<AccountAffilitaionsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Accounts)
    private readonly accountRepository: Repository<Accounts>,
    @InjectRepository(AccountAffiliations)
    private readonly accountAffiliationsRepository: Repository<AccountAffiliations>,
    @InjectRepository(AccountAffilitaionsHistory)
    private readonly accountsAffiliationsHistoryRepository: Repository<AccountAffilitaionsHistory>
  ) {
    super(accountsAffiliationsHistoryRepository);
  }

  async createAffiliations(
    id: any,
    user: User,
    createAffiliationsDto: AccountAffiliationsDto
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
      const closeout_account_affiliations = [];

      let savedAccountAffiliations: any;
      if (createAffiliationsDto.deleteAffiliations.length > 0) {
        for (const item of createAffiliationsDto.deleteAffiliations) {
          const where: any = {
            id: item,
            is_archived: false,
          };
          const account_affiliation: any =
            await this.accountAffiliationsRepository.findOne({
              where: where,
              relations: [
                'created_by',
                'tenant',
                'account_id',
                'affiliation_id',
              ],
            });
          if (!account_affiliation) continue;
          if (account_affiliation) {
            closeout_account_affiliations.push(account_affiliation);
          }

          account_affiliation.is_archived = true;
          deletePromises.push(
            this.accountAffiliationsRepository.save(account_affiliation)
          );
        }
        await Promise.all(deletePromises);
        savedAccountAffiliations = [];
      }

      const promises = [];
      if (createAffiliationsDto.allAffiliations.length > 0) {
        for (const affiliationItem of createAffiliationsDto.allAffiliations) {
          const affiliationId: any = affiliationItem;
          const findAllAffiliation = closeout_account_affiliations.find(
            (ele) => ele?.affiliation_id?.id == affiliationId
          );
          const affiliation: any = new AccountAffiliations();
          affiliation.is_archived = false;
          affiliation.created_by = user;
          affiliation.account_id = id;
          affiliation.tenant_id = user?.tenant?.id;
          affiliation.affiliation_id = affiliationId;
          if (findAllAffiliation) {
            affiliation.closeout_date = findAllAffiliation?.closeout_date;
            affiliation.start_date = findAllAffiliation?.start_date;
          } else {
            affiliation.start_date = new Date();
          }
          const data = await this.accountAffiliationsRepository.save(
            affiliation
          );
          delete data?.created_by;
          promises.push(this.accountAffiliationsRepository.save(data));
        }
        savedAccountAffiliations = await Promise.all(promises);
      }

      return resSuccess(
        'Affiliations Added.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedAccountAffiliations
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateAffiliation(
    id: any,
    user: User,
    affiliationsDto: AccountAffiliationsDto
  ) {
    try {
      const where: any = {
        id: id,
        is_archived: false,
      };
      const account_affiliation: any =
        await this.accountAffiliationsRepository.findOne({
          where: where,
          relations: ['created_by', 'tenant', 'account_id', 'affiliation_id'],
        });

      account_affiliation.closeout_date = affiliationsDto?.closeout_date;
      account_affiliation.created_at = new Date();
      account_affiliation.created_by = this.request?.user;

      const updatedAccountAffiliation =
        await this.accountAffiliationsRepository.save(account_affiliation);
      return resSuccess(
        'Affiliation updated successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllAffiliations(
    id: any,
    getAllAccountAffiliationsInterface: GetAllAccountAffiliationsInterface
  ) {
    try {
      const is_current =
        getAllAccountAffiliationsInterface.is_current === 'true';
      const co_id = getAllAccountAffiliationsInterface.co_id;
      const where: any = [
        {
          is_archived: false,
          account_id: { id: id },
          closeout_date: is_current
            ? MoreThanOrEqual(moment().format('YYYY-MM-DD')) || IsNull()
            : LessThan(moment().format('YYYY-MM-DD')),
        },
        {
          is_archived: false,
          account_id: { id: id },
          closeout_date: is_current
            ? IsNull()
            : LessThan(moment().format('YYYY-MM-DD')),
        },
      ];
      const response = await this.accountAffiliationsRepository.find({
        where: where,
        relations: ['created_by', 'tenant', 'account_id', 'affiliation_id'],
        order: { id: 'ASC' },
      });
      return {
        status: HttpStatus.OK,
        response: 'Affiliations Fetched ',
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
