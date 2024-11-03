import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus } from '@nestjs/common';
import { DialingCenterController } from '../controller/dialing-center.controler';
import { DialingCenterService } from '../service/dialing-center-call-jobs.service';
import { DialingCenterCallJobsQueryDto } from '../dto/dialing-center-query.dto';

describe('CallCenterSettingsController', () => {
  let dialingCenterController: DialingCenterController;
  let dialingCenterService: DialingCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DialingCenterController],
      providers: [
        {
          provide: DialingCenterService,
          useValue: {
            create: jest.fn(),
            getAllDialingCenterCallJobs: jest.fn(),
          },
        },
      ],
    }).compile();
    dialingCenterController = module.get<DialingCenterController>(
      DialingCenterController
    );
    dialingCenterService =
      module.get<DialingCenterService>(DialingCenterService);
  });

  describe('createDialingCenterCallJob', () => {
    const dialingCenterCallJobDto: any = {
      call_job_id: 5,
      actual_calls: 0,
      is_start_calling: false,
    };

    const dialingCenterCallJobResponse: any = {
      timestamp: '2024-02-20T13:20:52.358Z',
      status: 'success',
      response: 'Dialing Center Call Job Created Successfully.',
      status_code: 201,
      record_count: 0,
      data: {
        call_job_id: 5,
        actual_calls: 0,
        is_start_calling: false,
        id: '3',
        is_archived: false,
        created_at: '2024-02-21T09:19:50.069Z',
      },
      timezone: '',
    };

    it('Should create Dialing Center Call Job', async () => {
      jest
        .spyOn(dialingCenterService, 'create')
        .mockResolvedValue(dialingCenterCallJobResponse);
      const result = await dialingCenterController.createDialingCenterCallJob(
        dialingCenterCallJobDto
      );
      expect(result.status_code).toEqual(HttpStatus.CREATED);
      expect(result.data.call_job_id).toEqual(
        dialingCenterCallJobDto.call_job_id
      );
      expect(result.data.actual_calls).toEqual(
        dialingCenterCallJobDto.actual_calls
      );
      expect(result.data.is_start_calling).toEqual(
        dialingCenterCallJobDto.is_start_calling
      );

      expect(dialingCenterService.create).toHaveBeenCalledWith(
        dialingCenterCallJobDto
      );
    });
  });

  describe('Getting all dialing center call jobs', () => {
    const dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto = {
      limit: '5',
      page: '1',
      sortBy: 'name',
      sortOrder: 'ASC',
      status: 'scheduled',
    };

    const response: any = {
      timestamp: '2024-02-20T13:20:52.358Z',
      status: 'success',
      response: 'Call Jobs Successfully Fetched.',
      code: 200,
      call_jobs_count: '3',
      data: [
        {
          id: '5',
          status: 'scheduled',
          job_start_date: '2024-02-15T23:00:00.000Z',
          name: 'Missouri Road',
          operation_date: '2024-01-18T04:00:00.000Z',
          operationable_type: 'Sessions',
          assignedto: 'muhammad hussain, UAT Staff',
          planned_calls: '250',
          actual_calls: '77',
          job_progress: '31',
        },
        {
          id: '4',
          status: 'scheduled',
          job_start_date: '2024-02-14T23:00:00.000Z',
          name: 'Test Drive name\n',
          operation_date: '2024-01-30T23:00:00.000Z',
          operationable_type: 'Drives',
          assignedto: 'ABC  Test test, Test a ewr',
          planned_calls: '500',
          actual_calls: '17',
          job_progress: '3',
        },
        {
          id: '10',
          status: 'scheduled',
          job_start_date: '2024-02-19T23:00:00.000Z',
          name: 'Test Drive name\n',
          operation_date: '2024-01-30T23:00:00.000Z',
          operationable_type: 'Drives',
          assignedto: 'Eric Cartman, muhammad hussain',
          planned_calls: '250',
          actual_calls: '0',
          job_progress: '0',
        },
      ],
      timezone: '',
    };

    it('should fetch all filtered dialing center call jobs', async () => {
      jest
        .spyOn(dialingCenterService, 'getAllDialingCenterCallJobs')
        .mockResolvedValue(response);
      const result = await dialingCenterController.getAllCallJobs(
        dialingCenterCallJobsQueryDto
      );
      expect(result).toEqual(response);
      expect(
        dialingCenterService.getAllDialingCenterCallJobs
      ).toHaveBeenCalledWith(dialingCenterCallJobsQueryDto);
    });
  });
});
