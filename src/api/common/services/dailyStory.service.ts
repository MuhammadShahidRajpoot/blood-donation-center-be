import { HttpStatus } from '@nestjs/common';
import { Token } from 'aws-sdk';
import axios from 'axios';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';

export async function getDecryptedTenantConfig(id: any, tenantRepository: any) {
  try {
    const tenant = await tenantRepository.findOne({
      where: { id: id },
      relations: ['configuration_detail'],
    });

    if (!tenant) {
      return resError(
        `Tenant Config not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    const transformedData = tenant?.configuration_detail?.map(
      (detail: any) => ({
        element_name: detail.element_name,
        secret_key: decryptSecretKey(detail?.secret_key) || detail?.secret_key,
        secret_value:
          decryptSecretKey(detail?.secret_value) || detail?.secret_value,
        end_point_url: detail?.end_point_url,
      })
    );

    return resSuccess(
      'Tenant config found Successfully.', // message
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      transformedData[0]
    );
  } catch (error) {
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function getTenantData(id: any, tenantRepository: any) {
  try {
    const tenant = await tenantRepository.findOne({
      where: { id: id },
      relations: ['configuration_detail'],
    });

    if (!tenant) {
      return resError(
        `Tenant Config not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    return resSuccess(
      'Tenant config found Successfully.', // message
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      tenant
    );
  } catch (error) {
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function createDailyStoryTenant(
  tenantName: string,
  email: string,
  dailyStoryToken: string
): Promise<any> {
  if (!dailyStoryToken)
    return resError('DS Tenant config not found', ErrorConstants.Error, 500);
  const degree37Apitoken = decryptSecretKey(dailyStoryToken);
  // const degree37Apitoken = `${process.env.DAILY_STORY_API_TOKEN}`;
  const degree37ApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/admin/tenant/provision/`;

  const degree37Payload = {
    key: `${process.env.DAILY_STORY_D37_key}`,
    name: tenantName,
    emails: [email],
    // settings: [
    //   {
    //     '034cdba4-4e8b-419b-8683-a448d7756cb9': `${uniqueId}`,
    //   },
    // ],
    // Add other required fields as needed
  };

  try {
    const degree37Response = await axios.post(degree37ApiUrl, degree37Payload, {
      headers: {
        Authorization: `Bearer ${degree37Apitoken}`,
      },
    });
    // const degree37Response = {
    //   data: {
    //     Status: true,
    //     Message: '',
    //     Response: {
    //       tenantuid: 'h09dejtgtmq02v4l',
    //       token: {
    //         DateCreated: '2023-12-10T19:25:38.1225743Z',
    //         Token: 'nddfqxgcx7kmyjy8kiqpnhsv2-us-2',
    //         Description: 'API token',
    //         TenantId: 121,
    //       },
    //     },
    //   },
    // };
    const degree37Data = degree37Response?.data?.Response;
    return degree37Data;
  } catch (error) {
    console.error('Error calling Degree 37 API:', error);
    return resError(
      `Error provisioning tenant`,
      ErrorConstants.Error,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export async function sendDegree37Invitation(
  apiToken: string,
  fullName: string,
  email: string
): Promise<any> {
  const degree37ApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/invite/`;

  const degree37Payload = {
    Fullname: fullName,
    Email: email,
    // Add other required fields as needed
  };

  try {
    const degree37Response = await axios.post(degree37ApiUrl, degree37Payload, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const degree37Data = degree37Response?.data?.Response;

    return degree37Data;
  } catch (error) {
    console.error('Error sending Degree 37 invitation:', error.message);
    return resError(
      `Error sending invitation`,
      ErrorConstants.Error,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export async function getDailyStoryTenantUsers(apiToken: string): Promise<any> {
  const degree37ApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/users/`;

  try {
    const degree37Response = await axios.get(degree37ApiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const degree37Data = degree37Response?.data;

    return degree37Data;
  } catch (error) {
    console.error('Error getting DailyStory Tenant Users:', error.message);
    return resError(
      `Error getting DailyStory Tenant Users`,
      ErrorConstants.Error,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export async function getDailyStoryTenantUser(
  apiToken: string,
  userUid: string
): Promise<any> {
  try {
    if (!userUid) {
      return resError(
        `User ID is required`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
    const degree37ApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/user/${userUid}`;
    const degree37Response = await axios.get(degree37ApiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const degree37Data = degree37Response?.data;

    return degree37Data;
  } catch (error) {
    console.error('Error getting DailyStory Tenant User:', error.message);
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function deleteDailyStoryTenantUser(
  apitoken: string,
  userUid: string
): Promise<any> {
  try {
    if (!userUid) {
      return resError(
        `User ID is required`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
    const degree37ApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/user/${userUid}`;
    const degree37Response = await axios.delete(degree37ApiUrl, {
      headers: {
        Authorization: `Bearer ${apitoken}`,
      },
    });
    const degree37Data = degree37Response?.data;
    return degree37Data;
  } catch (error) {
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function createOrUpdateCampaign(data: any, token: string) {
  const apiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/campaign`;

  const campaignsData = [
    {
      tenantId: `${data?.tenantId}`,
      campaignId: '0',
      // name: `D37-${data?.tenantName}`,
      name: 'System Generated Emails',
      description: 'System Generated Emails',
      conversionGoals: {
        enabled: false,
        suspects: 0,
        mcls: 0,
        mqls: 0,
        sqls: 0,
      },
      status: 'Active',
      url_shortener: null,
    },
    {
      tenantId: `${data?.tenantId}`,
      campaignId: '0',
      // name: `D37-${data?.tenantName}`,
      name: 'On Demand Emails',
      description: 'On Demand Emails',
      conversionGoals: {
        enabled: false,
        suspects: 0,
        mcls: 0,
        mqls: 0,
        sqls: 0,
      },
      status: 'Active',
      url_shortener: null,
    },
    {
      tenantId: `${data?.tenantId}`,
      campaignId: '0',
      // name: `D37-${data?.tenantName}`,
      name: 'Prospects',
      description: 'Prospects',
      conversionGoals: {
        enabled: false,
        suspects: 0,
        mcls: 0,
        mqls: 0,
        sqls: 0,
      },
      status: 'Active',
      url_shortener: null,
    },
  ];

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const responses = await Promise.all(
      campaignsData.map(async (campaign) => {
        try {
          const response = await axios.post(apiUrl, campaign, { headers });
          return response.data;
        } catch (error) {
          // Handle individual error
          console.error('Error creating or updating campaign:', error.message);
          return resError(error.message, ErrorConstants.Error, error.status);
        }
      })
    );

    const allCampaigns = responses.map((obj) => obj.Response.id).join(', ');

    return allCampaigns;
  } catch (error) {
    // Handle error
    console.error('Error creating or updating campaign:', error.message);
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function getDSTemplates(
  campaignId: number,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/emails/${campaignId}`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const templates: any = await axios.get(url, { headers });
    return templates?.data;
  } catch (error) {
    console.log({ error });
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function createOrUpdateSegment(
  name: string,
  id: number,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/segment`;
    const payload = {
      id: id,
      name: name,
    };
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const segment: any = await axios.post(url, payload, { headers });
    return segment?.data;
  } catch (error) {
    console.log({ error });
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function addContactToSegment(
  contacts: [],
  segmentId: number,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/segment/contacts/${segmentId}`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const segment: any = await axios.post(url, JSON.stringify(contacts), {
      headers,
    });
    return segment;
  } catch (error) {
    console.log({ error });
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function getAllSegmentsFromDailyStory(apiToken: string) {
  const dailyStoryApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/segments`;
  try {
    const dailystoryResponse = await axios.get(dailyStoryApiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const dailyStorySegmentsData = dailystoryResponse?.data;
    if (dailyStorySegmentsData.Status === false) {
      return resError(
        'Unable to get DailyStory Segments',
        ErrorConstants.Error,
        500
      );
    }
    return dailyStorySegmentsData;
  } catch (error) {
    console.error('Error getting DailyStory Segments:', error.message);
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function getAllSegmentsContactsFromDailyStory(
  apiToken: string,
  segmentId: string
) {
  const dailyStoryApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/segment/${segmentId}/members`;
  try {
    const dailystoryResponse = await axios.get(dailyStoryApiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const segmentsContactsData = dailystoryResponse?.data;
    if (segmentsContactsData.Status === false) {
      return resError(
        'Unable to get DailyStory Segments Contacts',
        ErrorConstants.Error,
        500
      );
    }
    return segmentsContactsData;
  } catch (error) {
    console.error('Error getting DailyStory Segments Contacts:', error.message);
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}
export async function addSegmentToCampaign(
  segmentId: string,
  campaignId: number,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/campaign/${campaignId}/segment`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const payload = {
      segmentId: segmentId,
    };
    const segment: any = await axios.post(url, payload, { headers });
    return segment;
  } catch (error) {
    console.log({ error });
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function createOrUpdateEmail(
  body,
  emailId: number,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/email/${emailId}`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const res: any = await axios.post(url, body, {
      headers,
    });

    return res.data;
  } catch (error) {
    console.log({ error });
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function scheduleEmail(payload, dailyStoryToken: string) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/schedule`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const res: any = await axios.post(url, JSON.stringify(payload), {
      headers,
    });

    return res.data;
  } catch (error) {
    console.log({ error });
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}

export async function deleteScheduleEmail(
  scheduleId: string,
  dailyStoryToken: string
): Promise<any> {
  try {
    const degree37ApiUrl = `${process.env.DAILY_STORY_COMMUNICATION_URL}/schedule/${scheduleId}`;
    const res = await axios.delete(degree37ApiUrl, {
      headers: {
        Authorization: `Bearer ${dailyStoryToken}`,
      },
    });
    const degree37Data = res?.data;
    return degree37Data;
  } catch (error) {
    return resError(error.message, ErrorConstants.Error, error.status);
  }
}
export enum MessageType {
  'email' = 'email',
}

interface emailBody {
  email_body: string;
  subject: string;
  from: string; // from email
  messageType: MessageType.email;
}
export async function sendDSEmail(
  templateId: any,
  toEmail: any,
  emailBody: emailBody,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/email/send/${templateId}?email=${toEmail}`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const emailResponse: any = await axios.post(url, emailBody, {
      headers,
    });

    return emailResponse?.data;
  } catch (error) {
    if (!error.response?.data?.Status) {
      return resError(
        error.response?.data?.Message || 'Seomthing went wrong',
        ErrorConstants.Error,
        error.status
      );
    }
  }
}

export async function sendDSSms(
  toNumber: any,
  message: string,
  dailyStoryToken: string
) {
  try {
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/textmessage/sendsingle?mobile=${toNumber}`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const smsResponse: any = await axios.post(
      url,
      {
        message: message,
      },
      {
        headers,
      }
    );

    return smsResponse?.data;
  } catch (error) {
    error ? (error['status'] = error?.response?.status) : {};
    error ? (error['message'] = error?.response?.data?.Message) : {};
    throw error;
  }
}

export async function createDSContact(
  email: string,
  first_name: string,
  last_name: string,
  phonenumber: string,
  contact_id: any,
  contact_type: string,
  dailyStoryToken:string,
  uuid:string
) {
  try {
    
    const url = `${process.env.DAILY_STORY_COMMUNICATION_URL}/contact/`;
    const headers = {
      Authorization: `Bearer ${dailyStoryToken}`,
    };
    const contactResponse: any = await axios.post(
      url,
      {
        email: email,
        phonenumber: phonenumber,
        extendedProperties: {
          contact_id: contact_id,
          contact_type: contact_type,
          first_name: first_name,
          last_name: last_name,
          contact_uuid: uuid
        },
      },
      {
        headers,
      }
    );

    return contactResponse?.data;
  } catch (error) {
    error ? (error['status'] = error?.response?.status) : {};
    error ? (error['message'] = error?.response?.data?.Message) : {};
    throw error;
  }
}
