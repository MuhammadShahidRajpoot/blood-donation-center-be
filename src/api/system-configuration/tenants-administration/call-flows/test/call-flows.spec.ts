import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus } from '@nestjs/common';
import { CallFlowsController } from '../controller/call-flows.controller';
import { CallFlowsService } from '../services/call-flows.service';
import { CallFlowsQueryDto } from '../query/call-flows-query.dto';
describe('CallCenterSettingsController', () => {
  let callFlowsControllers: CallFlowsController;
  let callFlowsService: CallFlowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallFlowsController],
      providers: [
        {
          provide: CallFlowsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            getCallFlow: jest.fn(),
            archiveOrSetAsDefault: jest.fn(),
            getAllCallFlows: jest.fn(),
          },
        },
      ],
    }).compile();
    callFlowsControllers = module.get<CallFlowsController>(CallFlowsController);
    callFlowsService = module.get<CallFlowsService>(CallFlowsService);
  });

  describe('createCallFlow', () => {
    const callFlowDto: any = {
      name: 'test call flow',
      is_default: true,
      caller_answer_call: 'transfer to agent',
      vmbox_detected: 'transfer to agent',
      is_active: true,
    };

    const callFlowCreateResponse: any = {
      status: 'success',
      response: 'Call Flow Created.',
      status_code: HttpStatus.OK,
      record_count: 0,
      data: {
        name: 'test call flow',
        is_default: true,
        caller_answer_call: 'transfer to agent',
        vmbox_detected: 'transfer to agent',
        is_active: true,
        is_archived: false,
      },
    };

    it('Should create Call Flow', async () => {
      jest
        .spyOn(callFlowsService, 'create')
        .mockResolvedValue(callFlowCreateResponse);
      const result = await callFlowsControllers.create(callFlowDto);
      expect(result.status_code).toEqual(HttpStatus.OK);
      expect(result.data.name).toEqual(callFlowDto.name);
      expect(result.data.is_default).toEqual(callFlowDto.is_default);
      expect(result.data.caller_answer_call).toEqual(
        callFlowDto.caller_answer_call
      );
      expect(result.data.vmbox_detected).toEqual(callFlowDto.vmbox_detected);
      expect(result.data.is_active).toEqual(callFlowDto.is_active);

      expect(callFlowsService.create).toHaveBeenCalledWith(callFlowDto);
    });
  });

  describe('updateCallFlow', () => {
    it('should update the Call Flow and return Call Flow details', async () => {
      const id: any = 1;
      const callFlowDto: any = {
        name: 'updated name',
        is_default: true,
        caller_answer_call: 'transfer to agent',
        vmbox_detected: 'transfer to agent',
        is_active: true,
      };

      const updateResponse: any = {
        status: 'success',
        response: 'Successfully Updated the Call Flow Details.',
        status_code: 204,
        record_count: 0,
        data: null,
      };

      jest.spyOn(callFlowsService, 'update').mockResolvedValue(updateResponse);

      const result = await callFlowsControllers.update(id, callFlowDto);

      expect(result).toEqual(updateResponse);
      expect(callFlowsService.update).toHaveBeenCalledWith(id, callFlowDto);
    });

    it('should throw an HttpException with 404 status code if Call Flow is not found', async () => {
      const id: any = 1;
      const callFlowDto: any = {
        name: 'updated name',
        is_default: true,
        caller_answer_call: 'transfer to agent',
        vmbox_detected: 'transfer to agent',
        is_active: true,
      };

      const response: any = {
        status: 'error',
        response: 'Call Flow not found.',
        status_code: HttpStatus.NOT_FOUND,
        data: null,
      };

      jest.spyOn(callFlowsService, 'update').mockResolvedValue(response);
      const result = await callFlowsControllers.update(id, callFlowDto);
      expect(result).toEqual(response);
      expect(callFlowsService.update).toHaveBeenCalledWith(id, callFlowDto);
    });
  });

  describe('Get Call Flow', () => {
    const id: any = 1000;
    const response: any = {
      status: 'success',
      response: '',
      code: 200,
      data: {
        id: '22',
        name: 'sadasdasda',
        caller_answer_call: 'transfer to agent',
        vmbox_detected: 'transfer to agent',
        is_default: false,
        is_active: true,
        is_archived: false,
      },
    };
    it('should get the one Call Flow', async () => {
      jest.spyOn(callFlowsService, 'getCallFlow').mockResolvedValue(response);
      const result = await callFlowsControllers.getCallFlow(id);
      expect(result).toEqual(response);
      expect(callFlowsService.getCallFlow).toHaveBeenCalledWith(id);
    });
  });

  describe('Setting Call Flow as Default', () => {
    const id: any = 1000;
    const callFlowPatchDto: any = {
      is_default: true,
    };

    const response: any = {
      timestamp: '2024-02-05T15:01:00.816Z',
      status: 'success',
      response: 'Call Flow Successfully Set as Default.',
      status_code: 204,
      record_count: 0,
      data: null,
    };

    it('should set call flow as default', async () => {
      jest
        .spyOn(callFlowsService, 'archiveOrSetAsDefault')
        .mockResolvedValue(response);
      const result = await callFlowsControllers.archiveOrSetAsDefault(
        id,
        callFlowPatchDto
      );
      expect(result).toEqual(response);
      expect(callFlowsService.archiveOrSetAsDefault).toHaveBeenCalledWith(
        id,
        callFlowPatchDto
      );
    });
  });

  describe('Archiving Call Flow', () => {
    const id: any = 1000;
    const callFlowPatchDto: any = {
      is_archived: true,
    };

    const response: any = {
      timestamp: '2024-02-05T15:01:00.816Z',
      status: 'success',
      response: 'Call Flow Archived Successfully.',
      status_code: 204,
      record_count: 0,
      data: null,
    };

    it('archive call flow', async () => {
      jest
        .spyOn(callFlowsService, 'archiveOrSetAsDefault')
        .mockResolvedValue(response);
      const result = await callFlowsControllers.archiveOrSetAsDefault(
        id,
        callFlowPatchDto
      );
      expect(result).toEqual(response);
      expect(callFlowsService.archiveOrSetAsDefault).toHaveBeenCalledWith(
        id,
        callFlowPatchDto
      );
    });
  });

  describe('Getting all Call Flows', () => {
    const id: any = 1000;
    const callFlowsQueryDto: CallFlowsQueryDto = {
      limit: '1',
      page: '1',
      sortBy: 'name',
      sortOrder: 'ASC',
      status: '',
    };

    const response: any = {
      timestamp: '2024-02-05T15:01:00.816Z',
      status: 'success',
      response: 'Call Flows Successfully Fetched.',
      code: 200,
      call_flows_count: 221,
      data: [
        {
          id: '180',
          name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          status: true,
          default: true,
          date: '2024-02-07T10:20:22.541Z',
        },
        {
          id: '44',
          name: 'adfasssdsadsaffasd',
          status: true,
          default: false,
          date: '2024-02-07T09:15:31.262Z',
        },
        {
          id: '179',
          name: 'adfasssdsadsaffasd',
          status: true,
          default: false,
          date: '2024-02-07T09:18:06.110Z',
        },
        {
          id: '178',
          name: 'adfasssdsadsaffasd',
          status: true,
          default: false,
          date: '2024-02-07T10:17:09.122Z',
        },
        {
          id: '195',
          name: 'adfasssdsadsaffasd',
          status: false,
          default: false,
          date: '2024-02-07T10:16:40.483Z',
        },
      ],
      timezone: '',
    };

    it('should fetch all filtered call flows', async () => {
      jest
        .spyOn(callFlowsService, 'getAllCallFlows')
        .mockResolvedValue(response);
      const result = await callFlowsControllers.getAllCallFlows(
        callFlowsQueryDto
      );
      expect(result).toEqual(response);
      expect(callFlowsService.getAllCallFlows).toHaveBeenCalledWith(
        callFlowsQueryDto
      );
    });
  });
});
