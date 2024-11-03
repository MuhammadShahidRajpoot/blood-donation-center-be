import {
  Injectable,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike } from 'typeorm';
import { CallCenterSettings } from '../entities/call-center-settings.entity';
import { CallCenterSettingsDto } from '../dto/call-center-settings.dto';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { CallCenterSettingsHistory } from '../entities/call-center-settings-history.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';

@Injectable()
export class CallCenterSettingsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CallCenterSettings)
    private readonly callCenterSettingsRepository: Repository<CallCenterSettings>,
    @InjectRepository(CallCenterSettingsHistory)
    private readonly callCenterSettingsHistoryRepository: Repository<CallCenterSettingsHistory>,
    @InjectRepository(User)
    private readonly entityManager: EntityManager
  ) {}

  async create(callCenterSettingsDto: CallCenterSettingsDto) {
    try {
      const { agent_standards, no_answer_call_treatment, call_settings } =
        callCenterSettingsDto;

      const callCenterSetting = new CallCenterSettings();
      const nestedObject = {
        ...agent_standards,
        ...call_settings,
        ...no_answer_call_treatment,
      };
      Object.assign(callCenterSetting, nestedObject);
      callCenterSetting.created_by = this.request?.user;
      callCenterSetting.tenant_id = this.request?.user?.tenant?.id;
      const savedCallCenterSettings =
        await this.callCenterSettingsRepository.save(callCenterSetting);

      return resSuccess(
        'Call Center Settings Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedCallCenterSettings
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(callCenterSettingsDto: CallCenterSettingsDto, id) {
    try {
      const callCenterSetting: any =
        await this.callCenterSettingsRepository.findOne({
          where: {
            id: id,
          },
          relations: {
            created_by: true,
            tenant_id: true,
          },
        });
      if (!callCenterSetting) {
        return resError(
          `Call Center Settings not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const nestedObject = {
        ...callCenterSettingsDto.agent_standards,
        ...callCenterSettingsDto.call_settings,
        ...callCenterSettingsDto.no_answer_call_treatment,
      };
      Object.assign(callCenterSetting, nestedObject);
      callCenterSetting.created_at = new Date();
      callCenterSetting.created_by = this.request?.user;
      callCenterSetting.tenant_id = this.request?.user?.tenant?.id;
      const savedCallCenterSettings =
        await this.callCenterSettingsRepository.save(callCenterSetting);
      return resSuccess(
        'Call Center Settings Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedCallCenterSettings
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }
  async findOne(): Promise<any> {
    try {
      const callCenterSettings =
        await this.callCenterSettingsRepository.findOne({
          where: {
            tenant_id: {
              id: this.request?.user?.tenant?.id,
            },
          },
          relations: {
            tenant_id: true,
          },
        });

      if (!callCenterSettings) {
        return resError(
          `Call Center Settings not found`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const mappedSettings = {
        id: callCenterSettings.id,
        agent_standards: {
          calls_per_hour: callCenterSettings.calls_per_hour,
          appointments_per_hour: callCenterSettings.appointments_per_hour,
          donors_per_hour: callCenterSettings.donors_per_hour,
          tenant_id: this.request?.user?.tenant?.id,
        },
        call_settings: {
          caller_id_name: callCenterSettings.caller_id_name,
          caller_id_number: callCenterSettings.caller_id_number,
          callback_number: callCenterSettings.callback_number,
          max_calls_per_rolling_30_days:
            callCenterSettings.max_calls_per_rolling_30_days,
          max_calls: callCenterSettings.max_calls,
          tenant_id: this.request?.user?.tenant?.id,
        },
        no_answer_call_treatment: {
          busy_call_outcome: callCenterSettings.busy_call_outcome,
          max_retries: callCenterSettings.max_retries,
          no_answer_call_outcome: callCenterSettings.no_answer_call_outcome,
          max_no_of_rings: callCenterSettings.max_no_of_rings,
          tenant_id: this.request?.user?.tenant?.id,
        },
        tenant_id: this.request?.user?.tenant?.id,
        created_at: callCenterSettings?.created_at?.toISOString(),
      };

      return resSuccess(
        'Call Center Settings Retrieved',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        mappedSettings
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
