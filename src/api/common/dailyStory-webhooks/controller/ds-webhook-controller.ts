import {
  Controller,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Get,
  Query,
  Param,
  Request,
  Put,
  Body,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CRMVolunteerService } from '../../../crm/contacts/volunteer/services/crm-volunteer.service';
import { StaffService } from '../../../crm/contacts/staff/services/staff.service';
import { DonorsService } from '../../../crm/contacts/donor/services/donors.service';
import {
  GetAllContactsInterface,
  SimpleDTO,
  UpdateContactDto,
} from '../interface/Contact-type.interface';
import { ContactTypeEnum } from 'src/api/crm/contacts/common/enums';
import { DSWebhookService } from '../services/ds-webhook.service';
import { UserRequest } from 'src/common/interface/request';
@ApiTags('Daily Story Webhooks 1')
@Controller('')
export class DSWebhookController {
  constructor(
    private readonly volunteerService: CRMVolunteerService,
    private readonly staffService: StaffService,
    private readonly donorService: DonorsService,
    private readonly dsWebhookService: DSWebhookService
  ) {}

  /**
   * list of entity
   * @param getAllInterface
   * @returns {objects}
   */
  @Get('/contact/:type/list')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['volunteer', 'staff', 'donor'],
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('type') type: any,
    @Query() getAllInterface: GetAllContactsInterface,
    @Request() req: any
  ) {
    getAllInterface['tenant_id'] = req.tenant.id;

    // handing startss - limit for DS
    if (getAllInterface.start) {
      getAllInterface.page = Math.ceil(
        (getAllInterface.start + 1) / getAllInterface.limit
      );
    }

    if (getAllInterface.timestamp) {
      getAllInterface.sortBy = 'updated_at';
      getAllInterface.sortOrder = 'ASC';
      getAllInterface.min_updated_at = getAllInterface.timestamp;
    }

    if (type === 'volunteer') {
      let response: any = await this.volunteerService.findAllFiltered(
        getAllInterface
      );
      if (response?.data.length > 0) {
        const updatedResponse = response.data.map((x) => {
          const newObj = payload('volunteer', {
            ...x,
            phone: x?.phone ? '+1' + x?.phone?.replace(/\D/g, '') : '',
            primary_phone: x?.primary_phone
              ? '+1' + x?.primary_phone?.replace(/\D/g, '')
              : '',
          });
          return newObj;
        });

        return (response = {
          ...response,
          data: updatedResponse,
        });
      } else {
        return response;
      }
    } else if (type === 'staff') {
      let response: any = await this.staffService.findAllFiltered(
        getAllInterface
      );
      if (response?.data.length > 0) {
        const updatedResponse = response.data.map((x) => {
          const newObj = payload('staff', {
            ...x,
            phone: x?.phone ? '+1' + x?.phone?.replace(/\D/g, '') : '',
            primary_phone: x?.primary_phone
              ? '+1' + x?.primary_phone?.replace(/\D/g, '')
              : '',
          });
          return newObj;
        });

        return (response = {
          ...response,
          data: updatedResponse,
        });
      } else {
        return response;
      }
    } else if (type === 'donor') {
      let response: any = await this.dsWebhookService.findAllDonors(
        getAllInterface,
        req.tenant
      );

      if (response?.data.length > 0) {
        const updatedResponse = response.data.map((x) => {
          const newObj = payload('donor', {
            ...x,
            phone: x?.phone ? '+1' + x?.phone?.replace(/\D/g, '') : '',
            primary_phone: x?.primary_phone
              ? '+1' + x?.primary_phone?.replace(/\D/g, '')
              : '',
          });
          return newObj;
        });

        return (response = {
          ...response,
          data: updatedResponse,
        });
      } else {
        return response;
      }
    }
  }

  /**
   * view of entity
   * @param id
   * @returns {object}
   */
  @Get('/contact/single/:uuid')
  @ApiBearerAuth()
  @ApiParam({ name: 'uuid', required: true, type: String })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('uuid') uuid: any, @Request() req: UserRequest) {
    let response: any;
    let type = 'donor';
    // serch from donors
    response = await this.dsWebhookService.findSingleDonor(null, req, uuid);

    // search from staff
    if (!response?.data) {
      response = await this.staffService.findOne(null, uuid);
      type = 'staff';
    }
    // search from volunteers
    if (!response?.data) {
      response = await this.volunteerService.findOne(null, uuid);
      type = 'volunteer';
    }

    //  phone.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND phone.contact_type <= '${ContactTypeEnum.OTHER_PHONE}
    // email.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND email.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')`
    const email = response?.data?.contact?.find(
      (el) =>
        el.contact_type >= ContactTypeEnum.WORK_EMAIL &&
        el.contact_type <= ContactTypeEnum.OTHER_EMAIL
    )?.data;
    let phone = response?.data?.contact?.find(
      (el) =>
        el.contact_type >= ContactTypeEnum.WORK_PHONE &&
        el.contact_type <= ContactTypeEnum.OTHER_PHONE
    )?.data;
    phone = phone ? '+1' + phone?.replace(/\D/g, '') : '';
    if (response?.data) {
      const updatedResponse = payload(type, {
        ...response.data,
        email,
        bloodType: response?.data?.blood_group_id?.name,
        phone,
      });
      return {
        ...response,
        data: updatedResponse,
      };
    } else {
      return response;
    }
  }

  @Put('/contact/:uuid')
  @ApiBearerAuth()
  @ApiParam({ name: 'uuid', required: true, type: String })
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['volunteer', 'staff', 'donor'],
  })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id') id: any,
    @Param('type') type: any,
    @Body() updateContactDto: UpdateContactDto
  ) {
    if (type === 'volunteer') {
      return updateContactDto;
    } else if (type === 'staff') {
      return updateContactDto;
    } else if (type === 'donor') {
      return updateContactDto;
    }
  }

  @Post('/webhook/ds/contact/dsid')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async contactDSId(@Body() updateContactDto: SimpleDTO) {
    return updateContactDto;
  }

  @Post('/webhook/ds/communication/email-status/bounced')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async emailStatus(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/email-status/bounced',
      type: 'Email Bounced',
    };
    return this.dsWebhookService.emailStatusBounced(
      updateContactDto,
      apiData,
      req
    );
  }

  @Post('/webhook/ds/communication/email-status/clicked')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async emailStatusClicked(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/email-status/clicked',
      type: 'Email Clicked',
    };
    return this.dsWebhookService.emailStatusClickedOpened(
      updateContactDto,
      apiData,
      req
    );
  }

  @Post('/webhook/ds/communication/email-status/opened')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async emailStatusOpened(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/email-status/opened',
      type: 'Email Opened',
    };
    return this.dsWebhookService.emailStatusClickedOpened(
      updateContactDto,
      apiData,
      req
    );
  }

  @Post('/webhook/ds/communication/opt-in/sms')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async optInSms(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/opt-in/sms',
      type: 'Opted in to text messaging',
    };
    return this.dsWebhookService.optInSms(updateContactDto, apiData, req);
  }
  @Post('/webhook/ds/communication/opt-in/email')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async optInEmail(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/opt-in/email',
      type: 'Opted in to email',
    };
    return this.dsWebhookService.optInEmail(updateContactDto, apiData, req);
  }
  @Post('/webhook/ds/communication/opt-out/sms')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async optOutSms(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/opt-out/sms',
      type: 'Opted out to text messaging',
    };
    return this.dsWebhookService.optOutSms(updateContactDto, apiData, req);
  }
  @Post('/webhook/ds/communication/opt-out/email')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async optOutEmail(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/opt-out/email',
      type: 'Opted out to email',
    };
    return this.dsWebhookService.optOutEmail(updateContactDto, apiData, req);
  }
  @Post('/webhook/ds/communication/new-contact')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async newContact(
    @Body() updateContactDto: any,
    @Query() sessionKey: string,
    @Request() req: any
  ) {
    const apiData = {
      url: '/webhook/ds/communication/new-contact',
      type: 'New Contact',
    };
    return this.dsWebhookService.newContact(updateContactDto, apiData, req);
  }
}

const payload = (type, x) => {
  // console.log(
  // x?.eligibilities?.find(
  //   (el) => el.donation_type?.becs_product_category === 'AFRAZPLT'
  // )?.next_eligibility_date
  // );

  const wholeBloodEligibity = x?.eligibilities?.find(
    (el) => el.donation_type?.becs_product_category === '*ZWB'
  );

  const plateletEligibility = x?.eligibilities?.find(
    (el) => el.donation_type?.becs_product_category === '*PLT'
  );

  const dredEligibility = x?.eligibilities?.find(
    (el) => el.donation_type?.becs_product_category === '*2R'
  );

  const ccpEligibility = x?.eligibilities?.find(
    (el) => el.donation_type?.becs_product_category === '*PLS'
  );

  return {
    // null fields
    dsId: null,
    salutation: '',
    doNotContact: false,
    maxContactFrequencyInDays: 0,
    optOutEmail: x?.is_optout_email || false,
    optOutSms: x?.is_optout_sms || false,
    optOutPush: x?.is_optout_push || false,
    optOutPhone: x?.is_optout_call || false,
    isPushEnabled: false,
    isWebPushEnabled: false,
    isSmsEnabled: false,
    isEmailEnabled: false,
    title: '',
    geoCode: x?.geo_code || '',
    tenant_id: x?.tenant_id || x?.tenant?.id || '',
    phone: x?.primary_phone || x?.phone || '',
    status: x?.status || x?.is_active || '',
    email: x?.email || x?.primary_email || '',
    city: x?.address_city || x?.city || x?.address?.city || '',
    dateBirth: x?.birth_date || null,
    uuid: x.contact_uuid || null,
    updated_at: x?.updated_at || '',
    firstName: x?.first_name || '',
    fullname:
      x?.name || x?.full_name || `${x?.first_name} ${x?.last_name}` || '',
    country: x?.address?.country || x?.address_country || '',
    lastName: x?.last_name || '',
    region: x?.address_state || x?.address?.state || '',
    state: x?.address_state || x?.address?.state || '',
    postalCode: x?.postalCode || x?.address?.zip_code || x?.zip_code || '',
    gender: x?.gender || '',
    address:
      x?.complete_address ||
      `${x?.address?.address1}, ${x?.address?.address2}` ||
      '',

    ...(type === 'donor' && {
      donorUuid: x?.external_id || '',
      bloodType: x?.bloodType || x?.blood_group || '',
      nextApptDate: x?.appointment_date || null,
      nextRecruitDate: x?.next_recruit_date || null,
      groupCode: [],

      plateletEligibilityDate: x?.plateletEligibilityDate || null,
      plateletLastDonatedDate: x?.plateletLastDonatedDate || null,
      plateletDonationsLifetime: x?.plateletDonationsLifetime || 0,
      plateletDonationsYearTodate: x?.plateletDonationsYearTodate || 0,
      plateletDonationsLastyear: x?.plateletDonationsLastyear || 0,

      wholeBloodEligibilityDate: x?.wholeBloodEligibilityDate || null,
      wholeBloodLastDonatedDate: x?.wholeBloodLastDonatedDate || null,
      wholeBloodDonationsLifetime: x?.wholeBloodDonationsLifetime || 0,
      wholeBloodDonationsYearTodate: x?.wholeBloodDonationsYearTodate || 0,
      wholeBloodDonationsLastyear: x?.wholeBloodDonationsLastyear || 0,

      dredEligibilityDate: x?.dredEligibilityDate || null,
      dredLastDonatedDate: x?.dredLastDonatedDate || null,
      dredDonationsLifetime: x?.dredDonationsLifetime || 0,
      dredDonationsYearTodate: x?.dredDonationsYearTodate || 0,
      dredDonationsLastyear: x?.dredDonationsLastyear || 0,

      ccpEligibilityDate: x?.ccpEligibilityDate || null,
      ccpLastDonatedDate: x?.ccpLastDonatedDate || null,
      ccpDonationsLifetime: x?.ccpDonationsLifetime || 0,
      ccpDonationsYearTodate: x?.ccpDonationsYearTodate || 0,
      ccpDonationsLastyear: x?.ccpDonationsLastyear || 0,

      donorNumber: x?.donorNumber || x?.donor_number || '',
      lastDonatedLocation: '',
      lastDonationDate:
        x?.lastDonationDate || x?.last_donation || x?.last_donation_date || '',
    }),
  };
};
