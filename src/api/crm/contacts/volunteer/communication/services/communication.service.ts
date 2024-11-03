import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import { Observable } from 'rxjs';
import {
  getDSTemplates,
  getTenantData,
  sendDSEmail,
  sendDSSms,
} from 'src/api/common/services/dailyStory.service';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { UserRequest } from 'src/common/interface/request';
import {
  Between,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Contacts } from '../../../common/entities/contacts.entity';
import { CreateCommunicationDto } from '../dto/create-communication.dto';
import { Communications } from '../entities/communication.entity';
import { communication_status_enum } from '../enum/communication.enum';
import { getDecryptedTenantConfig } from 'src/api/common/services/dailyStory.service';
import { GetAllCommunicationInterface } from '../interface/communication.interface';
import {
  decryptSecretKey,
  encryptSecretKey,
} from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';

@Injectable()
export class CommunicationService {
  // private readonly apiUrl = process.env.DAILY_STORY_COMMUNICATION_URL;
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    @InjectRepository(Communications)
    private readonly communicationsRepository: Repository<Communications>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly httpService: HttpService
  ) {}
  async create(createCommunicationDto: CreateCommunicationDto) {
    try {
      const {
        communicationable_id,
        communicationable_type,
        date,
        message_type,
        subject,
        message_text,
        template_id,
        status,
      } = createCommunicationDto;

      if (!communicationable_id) {
        return resError(
          `communicationable_id is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!communicationable_type) {
        return resError(
          `communicationable_type is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!message_type) {
        return resError(
          `Message type is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!message_text) {
        return resError(
          `Message text is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!date) {
        return resError(
          `Date is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const contactData: any = await this.contactsRepository.find({
        where: {
          contactable_id: communicationable_id,
          contactable_type: communicationable_type,
          is_primary: true,
        },
      });

      if (!contactData?.length) {
        return resError(
          `Contact not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      let contactObj: any = {};
      let dailystory_message_id: any;

      if (message_type == 'sms') {
        contactObj = contactData.find(
          (contact: any) => !contact?.data?.includes('@')
        );

        const phoneNumber = contactObj?.data?.replace(/[^0-9]/g, '');
        if (!phoneNumber) {
          return resError(
            `Phone Number is invalid.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        await this.sendSms('+1' + phoneNumber, message_text);
      } else if (message_type == 'email') {
        contactObj = contactData.find((contact: any) =>
          contact?.data?.includes('@')
        );
        createCommunicationDto.email_body = message_text;
        const resp = await this.sendEmail(
          template_id,
          contactObj?.data,
          createCommunicationDto
        );
        // if(resp?.status == 'error'){
        //   throw new HttpException(`${resp?.response}`, Number(`${resp.status_code}`));
        // }
        dailystory_message_id = resp?.Response?.messageid;

      }

      const communicationData: any = new Communications();
      communicationData.communicationable_id = communicationable_id;
      communicationData.communicationable_type = communicationable_type;
      communicationData.contacts_id = contactObj;
      communicationData.tenant_id = this.request.user?.tenant;
      communicationData.created_by = this.request?.user;
      communicationData.date = date;
      communicationData.message_type = message_type;
      communicationData.subject = subject;
      communicationData.message_text = message_text;
      communicationData.template_id = template_id;
      communicationData.status = communication_status_enum.DELIVERED;
      // communicationData.status_detail = status_detail;
      communicationData.dailystory_message_id = dailystory_message_id
        ? dailystory_message_id
        : '';

      const savedData = await this.communicationsRepository.save(
        communicationData
      );
      return resSuccess(
        'Communication Created.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(params: GetAllCommunicationInterface) {
    try {
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;

      let page = params?.page ? +params?.page : 1;

      if (page < 1) {
        page = 1;
      }
      const where: any = {
        is_archived: false,
        communicationable_id: params?.communicationable_id,
        communicationable_type: params?.communicationable_type,
      };
      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      if (params?.keyword) {
        Object.assign(where, {
          subject: ILike(`%${params?.keyword}%`),
        });
      }

      const paramsMsssageType = params?.message_type
        ? Array.isArray(params?.message_type)
          ? params?.message_type
          : [params?.message_type]
        : [];

      if (paramsMsssageType && paramsMsssageType?.length > 0) {
        Object.assign(where, {
          message_type: In(paramsMsssageType),
        });
      }

      if (params?.status) {
        const statusValues = params?.status
          .split(',')
          .map((item) => item.trim());
        if (statusValues.length > 0) {
          Object.assign(where, {
            status: In(statusValues),
          });
        } else {
          Object.assign(where, {
            status: params?.status,
          });
        }
      }

      if (params?.date) {
        let startDate: any;
        let endDate: any;

        const dateRange = params.date.split(',');

        if (dateRange?.[0]?.trim()) {
          const parsedStartDate = moment(dateRange[0]);
          if (parsedStartDate.isValid()) {
            startDate = parsedStartDate.startOf('day');
          }
        }

        if (dateRange[1]) {
          endDate = moment(dateRange[1]).endOf('day');
        }

        if (startDate !== undefined || endDate !== undefined) {
          if (startDate && endDate) {
            Object.assign(where, {
              date: Between(startDate, endDate),
            });
          } else if (startDate) {
            Object.assign(where, {
              date: MoreThanOrEqual(startDate),
            });
          } else if (endDate) {
            Object.assign(where, {
              date: LessThanOrEqual(endDate),
            });
          }
        }
      }

      let order: any = { id: 'DESC' }; // Default order

      if (params?.sortBy) {
        // Allow sorting by different columns
        const orderBy = params.sortBy;
        const orderDirection = params.sortOrder || 'DESC';
        order = { [orderBy]: orderDirection };
      }

      const [response, count] =
        await this.communicationsRepository.findAndCount({
          where,
          take: limit,
          skip: (page - 1) * limit,
          order,
        });

      return {
        status: HttpStatus.OK,
        message: 'Communication fetched successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const communicationData: any =
        await this.communicationsRepository.findOne({
          where: { id: id, is_archived: false },
        });

      if (!communicationData) {
        return resError(
          `Communication data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      return resSuccess(
        'Communication found successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        communicationData
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCampaigns(): Promise<Observable<axios.AxiosResponse<any, any>>> {
    try {
      const tenantConfigData = await getDecryptedTenantConfig(
        this.request.user?.tenant?.id,
        this.tenantRepository
      );
      const url = `${tenantConfigData?.data?.end_point_url}/campaigns`;
      const token = tenantConfigData?.data?.secret_key;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response: AxiosResponse<any> = await this.httpService
        .get(url, { headers })
        .toPromise();
      return response.data;
    } catch (error) {
      return error;
    }
  }

  async getEmailTemplates(campaignId: any) {
    try {
      const tenantData = await getTenantData(
        this.request?.user?.tenant?.id,
        this.tenantRepository
      );
      const token = decryptSecretKey(tenantData?.data?.dailystory_token);

      const response = await getDSTemplates(campaignId, token);
      return response;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async sendEmail(templateId: any, email: any, createCommunicationDto: any) {
    try {
      const tenantData = await getTenantData(
        this.request.user?.tenant?.id,
        this.tenantRepository
      );
      const token = decryptSecretKey(tenantData?.data?.dailystory_token);
      const response: any = await sendDSEmail(
        templateId,
        email,
        createCommunicationDto,
        token
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendSms(mobileNumber: any, message: any) {
    try {
      const tenantConfigData = await getTenantData(
        this.request.user?.tenant?.id,
        this.tenantRepository
      );

      const response: any = await sendDSSms(
        mobileNumber,
        message,
        decryptSecretKey(tenantConfigData?.data?.dailystory_token)
      );

      return response?.data;
    } catch (error) {
      throw error;
    }
  }
}
