import { Test } from '@nestjs/testing';
import { OperationDashboardController } from '../controller/dashboard-controller';
import { OperationDashboardService } from '../service/operation-dashboard.service';
import { KeyPerformanceIndicatorsFilter } from '../filters/filter-kpi';
//Important: the .spec extension was omitted because we want to ignore this test until all of the operation dashboard services are complete
describe('Operation Dashboard', () => {
  let controller: OperationDashboardController;
  let service: OperationDashboardService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [OperationDashboardController],
      providers: [
        {
          provide: OperationDashboardService,
          useValue: {
            fetchKeyPerformanceIndicators: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OperationDashboardController>(
      OperationDashboardController
    );
    service = module.get<OperationDashboardService>(OperationDashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Key Performance Indicators', () => {
    it('should call fetch KPI with correct params', async () => {
      const keyPerformanceIndicatorsFilter: KeyPerformanceIndicatorsFilter = {
        start_date: '03-02-2024',
        end_date: '03-16-2024',
        organizational_level: null,
        view_as: 'procedure',
        procedures: [],
      };
      await controller.fetchKPI(keyPerformanceIndicatorsFilter, undefined);
      expect(service.fetchKeyPerformanceIndicators).toHaveBeenCalledWith(
        keyPerformanceIndicatorsFilter,
        undefined
      );
    });

    it('should return the result from fetch KPI', async () => {
      const keyPerformanceIndicatorsFilter: KeyPerformanceIndicatorsFilter = {
        start_date: '03-02-2024',
        end_date: '03-16-2024',
        organizational_level: null,
        view_as: 'procedure',
        procedures: [],
      };

      const mockKpiData = {
        status: 'success',
        response: 'Kpi data fetched successfully.',
        status_code: 200,
        record_count: 1,
        data: {
          drives: 222,
          sessions: 511,
          goal: 100,
          scheduled: 80,
          actual: 65,
          oef: 15,
          total_donors: 40,
          deferrals: 5,
          qns: 2,
          walkout: 3,
          first_time_donor: 18,
          total_appointments: 120,
          slots_available: 1500,
        },
      };

      jest
        .spyOn(service, 'fetchKeyPerformanceIndicators')
        .mockResolvedValue(mockKpiData);

      await controller.fetchKPI(keyPerformanceIndicatorsFilter, undefined);

      expect(service.fetchKeyPerformanceIndicators).toEqual(mockKpiData);
    });
  });
});
