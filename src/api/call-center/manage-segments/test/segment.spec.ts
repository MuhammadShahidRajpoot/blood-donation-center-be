import { Test, TestingModule } from '@nestjs/testing';
import { ManageSegmentsController } from '../controller/manage-segments.controller';
import { ManageSegmentsService } from '../services/manage-segments.service';
import { CreateSegmentsDto } from '../dto/segments.dto';
import { Response } from 'src/api/system-configuration/helpers/response';

describe('ManageSegmentsService', () => {
  let manageSegmentsService: ManageSegmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManageSegmentsController],
      providers: [
        {
          provide: ManageSegmentsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();
    manageSegmentsService = module.get<ManageSegmentsService>(
      ManageSegmentsService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const segmentData: CreateSegmentsDto = {
      tenant_id: BigInt('156789012345'),
      ds_segment_id: BigInt('123456756789012345'),
      name: 'test name',
      segment_type: 'dynamic',
      total_members: 3,
      ds_date_created: new Date(),
      ds_date_last_modified: new Date(),
    };

    const createdSegment: Response = {
      status: 'success',
      response: 'Segment Created',
      status_code: 201,
      record_count: 0,
      data: {
        id: BigInt(13),
        ...segmentData,
        created_at: new Date(),
        updated_at: new Date(),
      },
    };

    it('should create a new Segments', async () => {
      jest
        .spyOn(manageSegmentsService, 'create')
        .mockResolvedValue(createdSegment);

      const result = await manageSegmentsService.create(segmentData, 1);
      delete result.data.created_at;
      delete result.data.updated_at;
      expect(result).toEqual(createdSegment);
    });
  });
});
