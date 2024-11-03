import { Test } from '@nestjs/testing';
import { StaffSchedulesService } from '../../services/staff-schedules.service';
import { FilterStaffSchedulesInterface } from '../interfaces/filter-staff-schedules';
import { StaffSchedulesController } from '../controller/staff-schedules.controller';
import { FilterAvailableStaff } from '../interfaces/filter-available-staff';
import { FilterStaffSummaryInterface } from '../interfaces/filter-staff-summary';

describe('Staff Schedules', () => {
  let controller: StaffSchedulesController;
  let service: StaffSchedulesService;
  let mockData: any;
  let queriedMockData: any;
  let summaryMockData: any;
  let availableStaffMockData: any;
  let sharedStaffMockData: any;
  const emptyMockData: any = [];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StaffSchedulesController],
      providers: [
        {
          provide: StaffSchedulesService,
          useValue: {
            get: jest.fn(),
            search: jest.fn(),
            summary: jest.fn(),
            getAvailableStaff: jest.fn(),
            getSharedStaff: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StaffSchedulesController>(StaffSchedulesController);
    service = module.get<StaffSchedulesService>(StaffSchedulesService);

    mockData = {
      status: 'success',
      response: 'Staff Schedule fetched successfully.',
      status_code: 200,
      record_count: 2,
      data: [
        {
          staff_id: 203,
          staff_name: 'Haris Zahid',
          role_name: 'littel rock',
          total_hours: 12,
          shift_start_time: '2023-11-10T02:52:00.000Z',
          shift_end_time: '2023-11-10T06:58:00.000Z',
          return_time: '2023-11-10T03:04:00.000Z',
          depart_time: '2023-11-10T07:05:00.000Z',
          date: null,
          account_name: null,
          is_on_leave: false,
        },
        {
          staff_id: 204,
          staff_name: 'Tariq Ibn Ziyad',
          role_name: 'Conqueror',
          total_hours: 7,
          shift_start_time: '2023-11-10T02:52:00.000Z',
          shift_end_time: '2023-11-10T06:58:00.000Z',
          return_time: '2023-11-10T03:04:00.000Z',
          depart_time: '2023-11-10T07:05:00.000Z',
          date: '2023-10-08T00:00:00.000Z',
          account_name: 'Ulhassa',
          is_on_leave: true,
        },
      ],
    };

    queriedMockData = {
      status: 'success',
      response: 'Staff Schedule fetched successfully.',
      status_code: 200,
      record_count: 2,
      data: [
        {
          staff_id: 203,
          staff_name: 'Haris Zahid',
          role_name: 'littel rock',
          total_hours: 12,
          shift_start_time: '2023-11-10T02:52:00.000Z',
          shift_end_time: '2023-11-10T06:58:00.000Z',
          return_time: '2023-11-10T03:04:00.000Z',
          depart_time: '2023-11-10T07:05:00.000Z',
          date: null,
          account_name: null,
          is_on_leave: false,
        },
      ],
    };

    summaryMockData = {
      status: 'success',
      response: 'Staff Schedule fetched successfully.',
      status_code: 200,
      record_count: 0,
      data: [
        {
          operations: {
            total_operations: 23,
            fully_staffed: 7,
            overstaffed: 5,
            status_exclutions: 3,
          },
          staff: {
            total_staff: 33,
            average_overtime: 3,
            staff_in_overtime: 3,
            under_minimum_hours: 0,
          },
          efficiency: {
            exclude_travel_procedures_per_hour: 0.78,
            exclude_travel_products_per_hour: 0.88,
            include_travel_procedures_per_hour: 0.98,
            include_travel_products_per_hour: 1.78,
          },
        },
      ],
    };

    availableStaffMockData = {
      status: 'success',
      response: 'Staff Schedule fetched successfully.',
      status_code: 200,
      record_count: 0,
      data: [
        {
          id: 13,
          first_name: 'John',
          last_name: 'Doe',
          collection_operation: 33,
          teams: [3, 6, 8],
          schedule_dates: ['2024-01-03', '2024-01-17'],
          assigned_hours: 25,
          target_hours: 20,
          is_preferred: true,
          is_available: false,
          already_scheduled: true,
        },
      ],
    };

    sharedStaffMockData = {
      status: 'success',
      response: 'Staff Schedule fetched successfully.',
      status_code: 200,
      record_count: 0,
      data: [
        {
          id: 13,
          first_name: 'John',
          last_name: 'Doe',
          collection_operation: 33,
          teams: [3, 6, 8],
          schedule_dates: ['2024-01-03', '2024-01-17'],
          assigned_hours: 25,
          target_hours: 20,
        },
      ],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Staff Schedules', () => {
    it('should fetch staff schedules with the correct parameters', async () => {
      jest.spyOn(service, 'get').mockResolvedValue(mockData);

      const result = await controller.get(
        { page: 1, limit: 25, sortName: null, sortOrder: null },
        undefined
      );

      expect(result).toEqual(mockData);
      expect(result.status_code).toEqual(200);
      expect(service.get).toHaveBeenCalledWith(1, 25, null, null, undefined);
    });

    it('should return an empty array if limit is 0', async () => {
      jest.spyOn(service, 'get').mockResolvedValue(emptyMockData);

      const result = await controller.get(
        { page: 1, limit: 25, sortName: null, sortOrder: null },
        undefined
      );

      expect(result).toEqual(emptyMockData);
    });
  });

  describe('Search Staff Schedules', () => {
    it('should fetch searched data with the correct parameters', async () => {
      const filter: FilterStaffSchedulesInterface = {
        keyword: '',
        page: 1,
        limit: 30,
        staff_id: null,
        team_id: null,
        collection_operation_id: null,
        schedule_start_date: null,
        donor_id: null,
        schedule_status_id: null,
        tenant_id: null,
        sortName: null,
        sortOrder: null,
      };
      jest.spyOn(service, 'search').mockResolvedValue(mockData);
      const result = await controller.search(filter, undefined);

      expect(result).toEqual(mockData);
      expect(result.status_code).toEqual(200);
      expect(service.search).toHaveBeenCalledWith(filter);
    });

    it('should filter by the staff name and return correct data', async () => {
      const filter: FilterStaffSchedulesInterface = {
        keyword: 'Haris Zahid',
        page: 1,
        limit: 30,
        staff_id: null,
        team_id: null,
        collection_operation_id: null,
        schedule_start_date: null,
        donor_id: null,
        schedule_status_id: null,
        tenant_id: null,
        sortName: null,
        sortOrder: null,
      };

      jest.spyOn(service, 'search').mockResolvedValue(queriedMockData);
      const result = await controller.search(filter, undefined);

      expect(result).toEqual(queriedMockData);
      expect(result.status_code).toEqual(200);
      expect(service.search).toHaveBeenCalledWith(filter);
    });

    it('should return an empty array if query returns no data', async () => {
      const filter: FilterStaffSchedulesInterface = {
        keyword: 'asgfagewgwdfsf',
        page: 1,
        limit: 30,
        staff_id: 53,
        team_id: 432,
        collection_operation_id: 13,
        donor_id: 743,
        schedule_status_id: 12,
        schedule_start_date: null,
        tenant_id: null,
        sortName: null,
        sortOrder: null,
      };

      jest.spyOn(service, 'search').mockResolvedValue(queriedMockData);
      const result = await controller.search(filter, undefined);

      expect(result).toEqual(queriedMockData);
      expect(result.status_code).toEqual(200);
      expect(service.search).toHaveBeenCalledWith(filter);
    });
  });

  describe('Get Schedule Summary', () => {
    it('should fetch schedule summary data with the correct parameters', async () => {
      const filter: FilterStaffSummaryInterface = {
        schedule_id: 1,
        tenant_id: BigInt(311),
        is_published: 'true',
        limit: 25,
        page: 1,
        sortName: null,
        sortOrder: null,
      };

      jest.spyOn(service, 'summary').mockResolvedValue(summaryMockData);
      const result = await controller.summary(filter, undefined);

      expect(result).toEqual(summaryMockData);
      expect(result.status_code).toEqual(200);
      expect(service.summary).toHaveBeenCalledWith(filter);
    });
  });

  describe('Get Available Staff', () => {
    it('should fetch schedule available staff data with the correct parameters', async () => {
      const filter: FilterAvailableStaff = {
        role_id: 36,
        date: new Date('2024-01-05'),
        collection_operation_id: 35,
        schedule_start_date: new Date('2024-01-01'),
        shift_start_time: '14:00',
        shift_end_time: '15:30',
        tenant_id: BigInt(311),
        certifications: '5, 7, 4',
        page: 1,
        limit: 30,
        is_active: true,
      };
      const shiftId = 402;

      jest
        .spyOn(service, 'getAvailableStaff')
        .mockResolvedValue(availableStaffMockData);
      const result = await controller.availableStaff(
        filter,
        undefined,
        shiftId
      );

      expect(result).toEqual(availableStaffMockData);
      expect(result.status_code).toEqual(200);
      expect(service.getAvailableStaff).toHaveBeenCalledWith(filter, shiftId);
    });
  });

  describe('Get Shared Staff', () => {
    it('should fetch schedule shared staff members data with the correct parameters', async () => {
      const filter: FilterAvailableStaff = {
        role_id: 36,
        date: new Date('2024-01-05'),
        collection_operation_id: 35,
        schedule_start_date: new Date('2024-01-01'),
        shift_start_time: '14:00',
        shift_end_time: '15:30',
        tenant_id: BigInt(311),
        certifications: '5, 7, 4',
        page: 1,
        limit: 30,
        is_active: true,
      };
      const shiftId = 402;

      jest
        .spyOn(service, 'getSharedStaff')
        .mockResolvedValue(sharedStaffMockData);
      const result = await controller.sharedStaff(filter, undefined, shiftId);

      expect(result).toEqual(sharedStaffMockData);
      expect(result.status_code).toEqual(200);
      expect(service.getSharedStaff).toHaveBeenCalledWith(filter, shiftId);
    });
  });
});
