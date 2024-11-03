import { Test, TestingModule } from '@nestjs/testing';
import { CallCenterSettingsController } from '../controller/call-center-settings.controller';
import { CallCenterSettingsService } from '../services/call-center-settings.service';
import { HttpStatus } from '@nestjs/common';
describe('CallCenterSettingsController', () => {
  let callCenterSettingsController: CallCenterSettingsController;
  let callCenterSettingsService: CallCenterSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallCenterSettingsController],
      providers: [
        {
          provide: CallCenterSettingsService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();
    callCenterSettingsController = module.get<CallCenterSettingsController>(
      CallCenterSettingsController
    );
    callCenterSettingsService = module.get<CallCenterSettingsService>(
      CallCenterSettingsService
    );
  });

  describe('createCallCenterSettings', () => {
    const callCenterSettingsDto: any = {
      agent_standards: {
        calls_per_hour: 1,
        appointments_per_hour: 1,
        donors_per_hour: 1,
      },
      call_settings: {
        callback_number: '1234567890',
        caller_id_name: 'Test',
        caller_id_number: '1234567890',
        max_calls: 1,
        max_calls_per_rolling_30_days: 1,
      },
      no_answer_call_treatment: {
        busy_call_outcome: 1,
        max_no_of_rings: 1,
        max_retries: 1,
        no_answer_call_outcome: 1,
      },
    };

    const callCenterSettings: any = {
      status: 'success',
      response: '',
      status_code: 201,
      data: {
        id: 1,
        agent_standards: {
          calls_per_hour: 1,
          appointments_per_hour: 1,
          donors_per_hour: 1,
        },
        call_settings: {
          callback_number: '1234567890',
          caller_id_name: 'Test',
          caller_id_number: '1234567890',
          max_calls: 1,
          max_calls_per_rolling_30_days: 1,
        },
        no_answer_call_treatment: {
          busy_call_outcome: 1,
          max_no_of_rings: 1,
          max_retries: 1,
          no_answer_call_outcome: 1,
        },
        createdAt: new Date(),
        tenant_id: 1,
        createdBy: 1,
      },
    };

    it('Should create Call center settings', async () => {
      jest
        .spyOn(callCenterSettingsService, 'create')
        .mockResolvedValue(callCenterSettings);
      const result = await callCenterSettingsController.create(
        callCenterSettingsDto
      );
      expect(result).toEqual(callCenterSettings);
      expect(callCenterSettingsService.create).toHaveBeenCalledWith(
        callCenterSettingsDto
      );
    });
  });

  describe('updateCallCenterSettings', () => {
    it('should update the Call Center Settings and return Call Center Settings', async () => {
      const id: any = 1;
      const updateCallCenterSettingsDto = {
        agent_standards: {
          calls_per_hour: 1,
          appointments_per_hour: 1,
          donors_per_hour: 1,
        },
        call_settings: {
          callback_number: '1234567890',
          caller_id_name: 'Test',
          caller_id_number: '1234567890',
          max_calls: 1,
          max_calls_per_rolling_30_days: 1,
        },
        no_answer_call_treatment: {
          busy_call_outcome: 1,
          max_no_of_rings: 1,
          max_retries: 1,
          no_answer_call_outcome: 1,
        },
      };

      const response: any = {
        status: 'success',
        response: 'Call Center Settings successfully',
        status_code: HttpStatus.OK,
        data: {
          id: 1,
          agent_standards: {
            calls_per_hour: 1,
            appointments_per_hour: 1,
            donors_per_hour: 1,
          },
          call_settings: {
            callback_number: '1234567890',
            caller_id_name: 'Test',
            caller_id_number: '1234567890',
            max_calls: 1,
            max_calls_per_rolling_30_days: 1,
          },
          no_answer_call_treatment: {
            busy_call_outcome: 1,
            max_no_of_rings: 1,
            max_retries: 1,
            no_answer_call_outcome: 1,
          },
          createdAt: new Date(),
          tenant_id: 1,
          createdBy: 1,
        },
      };

      jest
        .spyOn(callCenterSettingsService, 'update')
        .mockResolvedValue(response);

      const result = await callCenterSettingsController.update(
        id,
        updateCallCenterSettingsDto
      );

      expect(result).toEqual(response);
      expect(callCenterSettingsService.update).toHaveBeenCalledWith(
        id,
        updateCallCenterSettingsDto
      );
    });

    it('should throw an HttpException with 404 status code if Call Center Settings is not found', async () => {
      const id: any = 1000;
      const updateCallCenterSettingsDto = {
        agent_standards: {
          calls_per_hour: 1,
          appointments_per_hour: 1,
          donors_per_hour: 1,
        },
        call_settings: {
          callback_number: '1234567890',
          caller_id_name: 'Test',
          caller_id_number: '1234567890',
          max_calls: 1,
          max_calls_per_rolling_30_days: 1,
        },
        no_answer_call_treatment: {
          busy_call_outcome: 1,
          max_no_of_rings: 1,
          max_retries: 1,
          no_answer_call_outcome: 1,
        },
      };

      const response: any = {
        status: 'error',
        response: 'Call Center Settings not found.',
        status_code: HttpStatus.NOT_FOUND,
        data: null,
      };

      jest
        .spyOn(callCenterSettingsService, 'update')
        .mockResolvedValue(response);
      const result = await callCenterSettingsController.update(
        id,
        updateCallCenterSettingsDto
      );
      expect(result).toEqual(response);
      expect(callCenterSettingsService.update).toHaveBeenCalledWith(
        id,
        updateCallCenterSettingsDto
      );
    });
  });
  describe('Get specific role', () => {
    const response: any = {
      status: 'success',
      response: 'Call Center Settings fetched successfully',
      status_code: HttpStatus.OK,
      data: {
        id: 1,
        agent_standards: {
          calls_per_hour: 1,
          appointments_per_hour: 1,
          donors_per_hour: 1,
        },
        call_settings: {
          callback_number: '1234567890',
          caller_id_name: 'Test',
          caller_id_number: '1234567890',
          max_calls: 1,
          max_calls_per_rolling_30_days: 1,
        },
        no_answer_call_treatment: {
          busy_call_outcome: 1,
          max_no_of_rings: 1,
          max_retries: 1,
          no_answer_call_outcome: 1,
        },
        createdAt: new Date(),
        tenant_id: 1,
        createdBy: 1,
      },
    };

    it('should get the one Call Center Settings ', async () => {
      jest
        .spyOn(callCenterSettingsService, 'findOne')
        .mockResolvedValue(response);
      const result = await callCenterSettingsService.findOne();
      expect(result).toEqual(response);
      expect(callCenterSettingsService.findOne).toHaveBeenCalledWith();
    });
  });
});
