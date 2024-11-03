import { Test, TestingModule } from '@nestjs/testing';
import { CallOutcomesController } from '../controller/call-outcomes.controller';
import { CallOutcomesService } from '../services/call-outcomes.service';
import { ColorCodeEnum } from '../enums/call-outcomes.enum';
import { CreateCallOutcomeDto } from '../dto/call-outcomes.dto';
import { HttpStatus } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { HttpStatus } from '@nestjs/common';
// import { CallOutcomesController } from '../controller/call-outcomes.controller';
// import { CallOutcomesService } from '../services/call-outcomes.service';
// import { CreateCallOutcomeDto } from '../dto/call-outcomes.dto';

describe('CallOutcomesController', () => {
  let callOutcomesController: CallOutcomesController;
  let callOutcomesService: CallOutcomesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallOutcomesController],
      providers: [
        {
          provide: CallOutcomesService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            archive: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();
    callOutcomesController = module.get<CallOutcomesController>(
      CallOutcomesController
    );
    callOutcomesService = module.get<CallOutcomesService>(CallOutcomesService);
  });
  describe('createCallOutcome', () => {
    const createCallOutcomeDto: any = {
      name: 'Test Call Outcome',
      code: 'TCO',
      color: ColorCodeEnum.blue, // Make sure to replace 'Blue' with a valid color code enum value
      next_call_interval: 60,
      is_active: true,
      is_archived: false,
    };

    const callOutcomeCreateResponse: any = {
      status: 'success',
      response: 'Call Outcome Created.',
      status_code: 201,
      record_count: 0,
      data: {
        name: 'Test Call Outcome',
        code: 'TCO',
        color: 'Blue',
        next_call_interval: 60,
        is_active: true,
        is_archived: false,
      },
    };

    it('Should create Call Outcome', async () => {
      jest
        .spyOn(callOutcomesService, 'create')
        .mockResolvedValue(callOutcomeCreateResponse);
      const result = await callOutcomesController.create(createCallOutcomeDto);
      expect(result.status_code).toEqual(HttpStatus.CREATED);
      expect(result.data.name).toEqual(createCallOutcomeDto.name);
      expect(result.data.code).toEqual(createCallOutcomeDto.code);
      expect(result.data.color).toEqual(createCallOutcomeDto.color);
      expect(result.data.next_call_interval).toEqual(
        createCallOutcomeDto.next_call_interval
      );
      expect(result.data.is_active).toEqual(createCallOutcomeDto.is_active);

      expect(callOutcomesService.create).toHaveBeenCalledWith(
        createCallOutcomeDto
      );
    });
  });

  // Add more test cases for other controller methods like update, findOne, archive, findAll
});
