import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RetryUtil } from './util/retryutil';
import { BBCSConstants } from './util/connectorconstants';
import { Injectable } from '@nestjs/common';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import {
  ModifyDonorAddress,
  ModifyDonorEmail,
  ModifyDonorWorkPhone,
  ModifyDonorHomePhone,
  ModifyDonorCellPhone,
} from './interfaces/modify';
import https from 'https';
import moment from 'moment';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';

@Injectable()
export class BBCSConnector {
  /**
   * The function `findSponsorGroup` makes a call to the BBCS API to find a sponsor group and returns
   * the response data.
   * @param {any} data - The `data` parameter is an object that contains the data to be sent in the
   * request to the BBCS API. It can include any necessary parameters or payload required by the API
   * endpoint specified in the `BBCSConstants.FIND_SPONSOR_GROUP_URL` constant.
   * @returns The function `findSponsorGroup` returns a Promise that resolves to an object. The
   * structure of the returned object depends on the response type received from the `callToBBCS`
   * function.
   */
  public async findSponsorGroup(data: any): Promise<any> {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.FIND_SPONSOR_GROUP_URL,
        data
      );
      const responseData = response.data;

      const responseTypeActions = {
        EXACT: () => {
          const exactMatch = responseData.data[0];
          return {
            uuid: exactMatch.UUID,
            id: exactMatch.id,
            type: 'EXACT',
            ...exactMatch,
          };
        },
        MULTIEXACT: () => {
          return {
            type: 'MULTIEXACT',
            ...responseData.data,
          };
        },
        NOMATCH: () => null,
      };

      const action = responseTypeActions[responseData.type];
      if (action) {
        return action();
      }

      throw new Error('Unsupported response type');
    } catch (error) {
      throw new Error('Failed to fetch data from BBCS API');
    }
  }

  /**
   * The function creates a new sponsor group via a BBCS API call.
   * @param {any} data - The `data` parameter is an object that contains the necessary information to
   * create a new sponsor group. It could include properties such as the sponsor group name,
   * description, and any other relevant details.
   * @param {TenantConfigurationDetail} config - The `config` parameter is an object of type
   * `TenantConfigurationDetail`. It contains configuration details specific to a tenant, such as API
   * keys, endpoints, and other settings required to make API calls to the BBCS (Blackbaud CRM) system.
   * @returns the data from the response of the API call.
   */
  public async createNewSponsorGroupApi(
    data: any,
    config: TenantConfigurationDetail
  ): Promise<any> {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.CREATE_SPONSOR_GROUP_URL,
        data,
        null,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to create a new sponsor group via BBCS API');
    }
  }

  public async createDonorBBCS(
    {
      firstName,
      lastName,
      birthDate,
      gender,
      addressLineOne,
      addressLineTwo = '',
      city,
      state = '',
      zipCode = '',
      homePhone = '',
      workPhone = '',
      email = '',
      cellPhone = '',
      user,
    },
    config: TenantConfigurationDetail
  ): Promise<any> {
    console.log({
      firstName,
      lastName,
      birthDate,
      gender,
      addressLineOne,
      addressLineTwo,
      city,
      state,
      zipCode,
      homePhone,
      workPhone,
      email,
      cellPhone,
      user,
    });

    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.NEW_DONOR_URL,
        {
          firstName,
          lastName,
          birthDate,
          gender: 'M',
          addressLineOne,
          addressLineTwo,
          city,
          state,
          zipCode,
          homePhone,
          workPhone,
          email,
          cellPhone,
          user,
        },
        null,
        config
      );
      console.log({ response });

      return response;
    } catch (error) {
      console.log({ error: error.message });

      throw new Error('Failed to create a new donor via BBCS API');
    }
  }

  public async donorAddressUpdateBBCS(
    {
      uuid,
      addressLineOne,
      addressLineTwo = '',
      city,
      state = '',
      zipCode = '',
      zipCodeExt = '',
      user,
    },
    config: TenantConfigurationDetail
  ) {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.EDIT_DONOR_URL,
        {
          uuid,
          addressLineOne,
          addressLineTwo,
          city,
          state,
          zipCode,
          zipCodeExt,
          user,
        },
        null,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update donor address via BBCS API');
    }
  }

  public async donorCommunicationUpdateBBCS(
    {
      uuid,
      email,
      workPhone,
      workPhoneExt = '',
      workCall = '',
      homePhone,
      homeCall = '',
      user,
      cellPhone,
      cellCall = '',
      cellText = '',
    },
    comCase: 'email' | 'workPhone' | 'homePhone' | 'cellPhone' = 'email',
    config: TenantConfigurationDetail
  ) {
    try {
      const params = {
        email: {
          email,
        },
        workPhone: {
          workPhone: workPhone?.replace(/[^\d]/g, ''),
          workPhoneExt,
          workCall,
        },
        homePhone: {
          homePhone: homePhone?.replace(/[^\d]/g, ''),
          homeCall,
        },
        cellPhone: {
          cellPhone: cellPhone?.replace(/[^\d]/g, ''),
          cellCall,
          cellText,
        },
      };
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.EDIT_DONOR_URL,
        {
          uuid,
          ...params[comCase],
          user,
        },
        null,
        config
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to update donor email via BBCS API');
    }
  }

  public async findDonorBBCS(
    { firstName, lastNames, birthDate, limit, email, start = '' },
    config?: TenantConfigurationDetail
  ): Promise<any> {
    try {
      console.log({
        values: { firstName, lastNames, birthDate, limit, start, email },
        url: BBCSConstants.BASE_URL + BBCSConstants.FIND_DONOR_URL,
      });

      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.FIND_DONOR_URL,
        {
          firstName,
          lastNames,
          birthDate,
          email,
          limit,
          // start,
        },
        null,
        config
      );
      return response;
    } catch (error) {
      console.log({ error });

      throw new Error('Failed to find a new donor via BBCS API');
    }
  }

  public async findDonorByUUIDBBCS({ externalId, config }): Promise<any> {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.FIND_DONOR_BY_UUID_URL,
        {
          uuid: externalId,
        },
        null,
        config
      );

      return response;
    } catch (error) {
      console.log(
        { error },
        '---------------------------- BBCS FIND DONOR ERROR---------------------'
      );

      throw new Error('Failed to find a new donor via BBCS API');
    }
  }

  // https://cooperativecomputing.atlassian.net/wiki/spaces/DE/pages/1512309295/BBCS+Update+Donor+Information+-+Solution#Additional-Donor-Donation-DTO

  public async createDonorDonation({
    donor_id,
    donation_type,
    donation_date,
    donation_status,
    next_eligibility_date,
    donation_ytd,
    donation_ltd,
    donation_last_year,
    account_id,
    drive_id,
    facility_id,
    points,
    is_achived,
  }): Promise<any> {
    try {
      const response = await this.callToBBCS(
        'POST',
        BBCSConstants.FIND_DONOR_ELIGIBILITY_URL,
        {},
        {
          donor_id,
          donation_type,
          donation_date,
          donation_status,
          next_eligibility_date,
          donation_ytd,
          donation_ltd,
          donation_last_year,
          account_id,
          drive_id,
          facility_id,
          points,
          is_achived,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to find a new donor via BBCS API');
    }
  }

  // https://cooperativecomputing.atlassian.net/wiki/spaces/DE/pages/1512309295/BBCS+Update+Donor+Information+-+Solution#Additional-Donor-Donation-DTO

  public async getDonorDonations({
    donation_type,
    donation_start_date,
    donation_end_date,
    account_id,
    is_achived,
  }) {
    try {
      const response = await this.callToBBCS(
        'POST',
        BBCSConstants.FIND_DONOR_ELIGIBILITY_URL,
        {},
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to find a new donor via BBCS API');
    }
  }

  /**
   * The function fetches donor data from a BBCS API endpoint using the provided parameters and returns
   * a Promise.
   * @param {number} limit - The limit parameter specifies the maximum number of donor records to
   * retrieve from the server. It determines the number of records that will be returned in the
   * response.
   * @param {string} start - The start parameter is a string that represents the starting point for
   * fetching donor data. It is used to paginate through the data and retrieve a specific subset of
   * donors.
   * @param {string} updatedDate - The `updatedDate` parameter is a string that represents the date and
   * time when the donors' data was last updated. It is used to fetch only the donors' data that has
   * been updated after the specified date and time.
   * @param {TenantConfigurationDetail} config - The `config` parameter is of type
   * `TenantConfigurationDetail` and is used to pass the configuration details for the tenant. It
   * contains information such as API keys, endpoints, and other settings specific to the tenant.
   * @returns a Promise that resolves to any data.
   */
  public async fetchDonorsData(
    limit: number,
    start: string,
    updatedDate: string,
    config: TenantConfigurationDetail
  ): Promise<any> {
    try {
      return await this.callToBBCS(
        'GET',
        BBCSConstants.DONOR_SYNC_URL,
        {
          limit,
          start,
          updatedDate,
        },
        null,
        config
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async fetchSingleDonorsData(UUID: string): Promise<any> {
    try {
      return await this.callToBBCS(
        'GET',
        BBCSConstants.SINGLE_DONOR,
        {
          uuid: UUID,
        },
        null
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async fetchDonorsDonationsData(
    limit: number,
    start: string,
    updatedDate: string
  ): Promise<any> {
    try {
      return await this.callToBBCS(
        'GET',
        BBCSConstants.DONOR_DONATION_SYNC_URL,
        {
          limit,
          start,
          updatedDate,
        },
        null
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * The function `getDonorEligibility` makes a POST request to a BBCS API endpoint to retrieve donor
   * eligibility information based on a UUID and target date.
   * @param {string} uuid - A string representing the unique identifier of the donor.
   * @param targetDate - The targetDate parameter is a moment object that represents the date for which
   * the donor eligibility is being checked. It is optional and defaults to the current date if not
   * provided.
   * @param {TenantConfigurationDetail} config - The `config` parameter is of type
   * `TenantConfigurationDetail`. It is an object that contains configuration details specific to a
   * tenant.
   * @returns the result of the callToBBCS function, which is a Promise.
   */
  public async getDonorEligibility(
    uuid: string[],
    targetDate = moment(),
    config: TenantConfigurationDetail
  ): Promise<any> {
    try {
      return await this.callToBBCS(
        'POST',
        BBCSConstants.DONOR_ELIGIBILITY_URL,
        null,
        {
          uuids: uuid,
          targetDate: targetDate.format('YYYY-MM-DD'),
        },
        config
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * The function fetches account group codes data by making a GET request to a specified URL using the
   * provided configuration.
   * @param {TenantConfigurationDetail} config - The `config` parameter is of type
   * `TenantConfigurationDetail`. It is used to pass the configuration details of the tenant to the
   * `fetchAccountGroupCodesData` function.
   * @returns a Promise that resolves to any data.
   */
  public async fetchAccountGroupCodesData(
    config: TenantConfigurationDetail
  ): Promise<any> {
    try {
      return await this.callToBBCS(
        'GET',
        BBCSConstants.ACCOUNT_URL,
        null,
        null,
        config
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async modifyDonor(
    params:
      | ModifyDonorAddress
      | ModifyDonorEmail
      | ModifyDonorWorkPhone
      | ModifyDonorHomePhone
      | ModifyDonorCellPhone,
    config: TenantConfigurationDetail
  ) {
    try {
      return await this.callToBBCS(
        'GET',
        BBCSConstants.MODIFY_DONOR_URL,
        params,
        null,
        config
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * The function `callToBBCS` is an asynchronous function that makes a request to the BBCS APIs
   * @param {string} method - The HTTP method to be used for the API call (e.g., GET, POST, PUT, DELETE).
   * @param {string} apiEndpoint - The `apiEndpoint` parameter is a string that represents the specific
   * endpoint of the BBCS API that you want to call. It is appended to the `baseUrl` to form the complete
   * URL for the API request.
   * @param {any} queryParams - queryParams is an object that contains the query parameters to be
   * included in the API request. These parameters are used to filter or modify the data returned by the
   * API.
   * @param {any} [data] - The `data` parameter is an optional parameter that represents the request
   * payload or body data that you want to send with the API request. It can be any valid JSON object or
   * data that needs to be sent to the API endpoint.
   * @param {TenantConfigurationDetail} [config] - The `config` parameter is an optional object that
   * contains the configuration details for the API call. It includes the `end_point_url` and
   * `secret_value` properties, which are used to construct the base URL and set the API key for the
   * request.
   * @returns The function `callToBBCS` returns a Promise that resolves to the response data from the
   * BBCS API.
   */
  private async callToBBCS(
    method: string,
    apiEndpoint: string,
    queryParams: any,
    data?: any,
    config?: TenantConfigurationDetail
  ): Promise<any> {
    console.log(queryParams);
    const baseUrl = config ? config?.end_point_url : process.env.BBCS_BASE_URL;
    const apiKey = config?.secret_value
      ? decryptSecretKey(config?.secret_value)
      : process.env.API_KEY;

    // creating axios request
    const requestConfig: AxiosRequestConfig = {
      method,
      url: baseUrl + apiEndpoint,
      headers: { apiKey },
      ...(queryParams && { params: queryParams }),
      ...(data && { data }),
    };
    // eslint-disable-next-line
    const isTransientError = (error: any) => {
      return error.status >= 500;
    };

    const makeRequest = async () => {
      try {
        // Start Code to Bypass SSL Certificate Error
        const agent = new https.Agent({
          rejectUnauthorized: false,
        });

        const axiosInstance: AxiosInstance = axios.create({
          httpsAgent: agent,
        });
        console.log(
          { requestConfig },
          '------------------- BBCS REQUEST CONFIG bbcsconnector.ts 551 ---------------------'
        );

        // End Code to Bypass SSL Certificate Error
        const response = await axiosInstance(requestConfig);
        console.log(
          { response },
          '------------------- BBCS RESPONSE bbcsconnector.ts 558 ----------------------'
        );
        // console.log(
        //   response?.data,
        //   '------------------- BBCS RESPONSE bbcsconnector.ts 558 ----------------------'
        // );
        return response.data;
      } catch (error) {
        console.log(
          { error },
          '------------------- BBCS ERROR bbcsconnector.ts 564 ----------------------'
        );
        console.log(error?.response);
        throw new Error(
          `Failed to make a request to BBCS API: ${error.message}`
        );
      }
    };
    return makeRequest();
    // return RetryUtil.retry(makeRequest, 3, 1000, isTransientError);
  }

  public async setDriveBBCS(
    {
      source,
      isNewDrive,
      driveDate,
      start,
      end,
      last,
      donors = 0,
      beds,
      donorsPerInterval,
      group,
      // group2,
      // group3,
      // group4,
      // group5,
      rep = '',
      startLunch = '',
      endLunch = '',
      driveID,
      // comment1 = '', // empty
      // comment2 = '', // empty
      // comment3 = '', // empty
      // comment4 = '', // empty
      // comment5 = '', // empty
      // comment6 = '', // empty
      // comment7 = '', // empty
      // comment8 = '', // empty
      description, //address line one
      addressLineOne = '',
      addressLineTwo = '',
      city,
      state = '',
      zipCode = '',
      zipCodeExt = '', //optional
    },
    config: TenantConfigurationDetail
  ) {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.SET_DRIVE_URL,
        {
          source,
          isNewDrive,
          driveDate,
          start,
          end,
          last,
          donors,
          beds,
          donorsPerInterval,
          group,
          // group2,
          // group3,
          // group4,
          // group5,
          rep,
          startLunch,
          endLunch,
          driveID,
          // comment1, // empty
          // comment2, // empty
          // comment3, // empty
          // comment4, // empty
          // comment5, // empty
          // comment6, // empty
          // comment7, // empty
          // comment8, // empty
          description, //address line one
          addressLineOne,
          addressLineTwo,
          city,
          state,
          zipCode,
          zipCodeExt, //optional
        },
        null,
        config
      );
      return response;
    } catch (error) {
      console.log({ error });
      throw new Error('Failed to update drive via BBCS API');
    }
  }

  public async setSlotsBBCS(
    { startTimes, drive, source, date, user },
    config: TenantConfigurationDetail
  ) {
    try {
      const response = await this.callToBBCS(
        'POST',
        BBCSConstants.SET_SLOTS_URL,
        null,
        {
          startTimes,
          drive,
          source,
          date,
          user,
        },
        config
      );
      return response;
    } catch (error) {
      console.log({ error });
      throw new Error('Failed to update drive via BBCS API');
    }
  }

  public async createAppointment(
    { source, appointmentTime, uuid, reason, status, comment, user },
    config: TenantConfigurationDetail
  ) {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.SET_APPT_URL,
        {
          source,
          appointmentTime,
          uuid,
          reason,
          status,
          comment,
          user,
        },
        null,
        config
      );
      return response;
    } catch (error) {
      console.log({ error });
      throw new Error('Failed to update drive via BBCS API');
    }
  }

  public async setSessionBBCS(
    { startDate, start, end, description, source },
    config: TenantConfigurationDetail
  ) {
    try {
      const response = await this.callToBBCS(
        'GET',
        BBCSConstants.SET_SESSION_URL,
        {
          startDate,
          start,
          end,
          description,
          source,
        },
        null,
        config
      );
      return response;
    } catch (error) {
      console.log({ error });
      throw new Error('Failed to set session via BBCS API');
    }
  }
}
