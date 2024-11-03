import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { Response } from 'express';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { StartCallingDto, updateCallDto } from '../dto/start-calling.dto';
import { StartCallingInterface } from '../interface/start-calling.interface';
import { CallStateInterface } from '../interface/call-state.interface';
import twilio, { RequestClient } from 'twilio';
import VoiceResponse from 'twilio';
import { ManageScriptsService } from 'src/api/call-center/manage-scripts/services/manage-scripts.services';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

class CustomTwilioHttpClient extends RequestClient {
  axiosInstance: AxiosInstance;
  defaultTimeout: number;
  autoRetry: boolean;
  maxRetryDelay: number;
  maxRetries: number;

  constructor(axiosInstance: AxiosInstance) {
    super();
    this.axiosInstance = axiosInstance;
    this.defaultTimeout = 30000; // default timeout in ms
    this.autoRetry = true; // auto-retry on failure
    this.maxRetryDelay = 5000; // maximum retry delay in ms
    this.axiosInstance = axiosInstance;
    this.maxRetries = 3; // Define the maximum number of retries
  }

  request(opts: any): Promise<any> {
    return this.axiosInstance({
      method: opts.method,
      url: opts.uri,
      params: opts.params,
      data: opts.data,
      headers: opts.headers,
      auth: {
        username: opts.username,
        password: opts.password,
      },
      timeout: opts.timeout || this.defaultTimeout,
    })
      .then((response: AxiosResponse) => ({
        statusCode: response.status,
        body: response.data,
        headers: response.headers,
      }))
      .catch((error: any) => {
        throw error;
      });
  }
}
import * as dotenv from 'dotenv';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
dotenv.config();

@Injectable()
export class StartCallingService {
  private twilioClient: twilio.Twilio;

  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    private readonly manageScriptsService: ManageScriptsService
  ) {
    const customAxiosInstance: AxiosInstance = axios.create({});

    const customTwilioHttpClient = new CustomTwilioHttpClient(
      customAxiosInstance
    );
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        httpClient: customTwilioHttpClient,
      }
    );
  }
  async voiceCallToken() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const appSid = process.env.TWILIO_TWIML_APP_SID;
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    const identity = '2343';
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);
    const respone = {
      token: accessToken.toJwt().toString(),
      tenant_id: this.request?.user?.tenant?.id,
    };
    return resSuccess(
      'Voice Call Token Generated',
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      respone
    );
  }
  async makeCallInitiation(res: Response, request: any) {
    try {
      const To = '+16176496457';
      const client = new VoiceResponse.twiml.VoiceResponse();
      client.dial(
        { callerId: '+16789818114', timeout: request.numberOfRings },
        To
      );
      res.set('Content-Type', 'application/xml');
      return res.send(client.toString());
    } catch (error) {
      console.log(`Exception occured: ${error}`);
    }
  }
  async holdCall(res: Response, callSid: string) {
    try {
      const childCalls = await this.twilioClient.calls.list({
        parentCallSid: callSid,
      });
      const call = await this.twilioClient.calls(childCalls[0]?.sid).update({
        twiml: '<Response><Enqueue >support</Enqueue></Response>',
      });
      return res.send(call);
    } catch (error) {
      console.log(`Exception occured: ${error}`);
    }
  }
  async resumeCall(res: Response, callSid: string) {
    try {
      const resumeExistingCall = await this.twilioClient.calls(callSid).update({
        twiml: '<Response><Dial></Dial></Response>',
      });
      // const call = await this.twilioClient.calls(callSid).update({
      //   twiml: '<Response><Dial></Dial></Response>',
      // });
      return res.send(resumeExistingCall);
    } catch (error) {
      console.log(`Exception occured: ${error}`);
    }
  }
  /*   async getCallInfo(startCallingInterface: StartCallingInterface) {
    const client = this.twilioClient;
    const { call_sid } = startCallingInterface;
    try {
      if (call_sid == null) {
        return resError(
          `call sid must be provided`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const callStatus = await client.calls(call_sid).fetch();

      return resSuccess(
        'Call Status Fetched',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        callStatus
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  } */
  // async hangupCall() {
  //   const hangup = new VoiceResponse.twiml.VoiceResponse();
  //   hangup.hangup();
  //   await this.twilioClient.calls().update({
  //     twiml: hangup.toString(),
  //   });
  // }
  /* async transferCallToAgent(startCalling: StartCallingInterface) {
    const phone_number = process.env.TWILIO_PHONE_NUMBER;
    const client = this.twilioClient;
    const transferedCall = client.calls(startCalling.call_sid).update({
      twiml: `<Response><Dial><Number>${phone_number}</Number></Dial></Response>`,
    });

    return resSuccess(
      'Call Successfully Transfered To Agent',
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      transferedCall
    );
  } */

  async playVoiceMessage(updateCallDto: updateCallDto) {
    try {
      const call = await this.twilioClient
        .calls(updateCallDto.child_call_sid)
        .update({
          twiml: `<Response><Play>
${updateCallDto.voice_message_url}</Play><Hangup/></Response> `,
        });
      const callResponse = {
        status: call.status,
        tenant_id: this.request?.user?.tenant?.id,
        sid: call.sid,
      };

      return resSuccess(
        'Voice Message played successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        callResponse
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /* async getAllCallsLogs(startCalling: StartCallingInterface) {
    const account_sid = process.env.TWILIO_ACCOUNT_SID;
    const auth_token = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(account_sid, auth_token); //eslint-disable-line
    try {
      const calls = await client.calls.list({
        status: startCalling.call_status,
      });

      return resSuccess(
        'Call Logs Fetched successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        calls
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  } */

  async getChildCallByParentCallSid(startCalling: StartCallingInterface) {
    try {
      try {
        const childCalls = await this.twilioClient.calls.list({
          parentCallSid: startCalling.parent_call_sid,
        });
        const call = await this.twilioClient.calls(childCalls[0]?.sid).fetch();

        const callResponse = {
          status: call.status,
          tenant_id: this.request?.user?.tenant?.id,
          sid: call.sid,
        };

        return resSuccess(
          'Call Fetched successfully',
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          callResponse
        );
      } catch (error) {
        console.log(`Exception occured: ${error}`);
        return resError(error.message, ErrorConstants.Error, error.status);
      }
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /* async getCallState(callStateInterface: CallStateInterface) {
    try {
      const { CallStatus } = callStateInterface;

      if (CallStatus == null) {
        return resError(
          `Call status doesn't exists in Twilio response.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return resSuccess(
        'Call Status Fetched successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        CallStatus
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  } */
}
