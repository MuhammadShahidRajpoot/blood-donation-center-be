import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { TenantModule } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/tenant.module';
import { entities } from 'src/database/entities/entity';
import { DepartController } from '../controller/depart.controller';
import { DepartService } from '../services/depart.service';
import { GetAllDepartFilteredInterface } from '../interface/depart.interface';
import { StaffingManagementDepartModule } from '../staffing-management-depart.module';

describe.skip('Depart Schedules', () => {
  let app: INestApplication;
  let tenantRepository: any;
  let userRepository: any;
  let loggedInUser: any;
  let jwtService: any;
  let access_token: any;
  let tenant: any;
  let controller: DepartController;
  let service: DepartService;
  let findAllData: any;
  let findAllFilteredData: any;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [DepartController],
      providers: [
        {
          provide: DepartService,
          useValue: {
            get: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
      imports: [
        StaffingManagementDepartModule,
        TenantModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.TEST_DB_NAME,
          entities: entities,
          logging: ['error'],
          synchronize: true,
          dropSchema: true,
          migrationsTableName: 'migrations',
          migrations: ['src/database/migrations/*.ts'],
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
    }).compile();

    tenantRepository = module.get('TenantRepository');
    userRepository = module.get('UserRepository');

    controller = module.get<DepartController>(DepartController);
    service = module.get<DepartService>(DepartService);
    jwtService = module.get<JwtService>(JwtService);

    app = module.createNestApplication();

    tenant = await tenantRepository.save({
      tenant_name: 'test',
      tenant_domain: 'https://test.com',
      admin_domain: 'https://test.com',
      tenant_code: 'test',
      phone_number: '036548522',
      password: '123456789',
      email: 'jd@test.com',
      is_active: true,
      created_by: 1,
    });

    loggedInUser = await userRepository.save({
      first_name: 'John',
      last_name: 'Doe',
      unique_identifier: 'jd',
      email: 'jd@test.com',
      is_active: true,
      tenant: tenant.id,
      created_by: 1,
    });

    access_token = jwtService.sign({
      email: loggedInUser?.email,
      id: loggedInUser?.id,
    });

    findAllData = {
      status: 'success',
      response: '',
      code: 200,
      record_count: 2,
      data: [
        {
          id: 1,
          account_name: 'Ram Beesly',
          location_name: 'Gymnasilum - Room 456',
          location_address: 'Metro, TX',
          sum_of_procedure_shifts: 40,
          sum_of_product_shifts: 50,
          date: '2023-08-21',
          shift_start_time: '2:00 PM',
          shift_end_time: '6:00 PM',
          vehicles: 'TRUCK A, Car B',
          depart_time: '3:00 PM',
          return_time: '9:00 PM',
          staff_requested: 8,
          staff_assigned: 6,
          oef: '1.77',
          staff_with_roles: ['CS - Dwight Schrute', 'DS - Parm Beesly'],
          created_at: '2023-09-21',
          created_by: 1,
        },
        {
          id: 2,
          account_name: 'Ram Suresh',
          location_name: 'Gymnasilum - Room 451',
          location_address: 'Metro, TX',
          sum_of_procedure_shifts: 40,
          sum_of_product_shifts: 50,
          date: '2023-08-21',
          shift_start_time: '2:00 PM',
          shift_end_time: '6:00 PM',
          vehicles: 'TRUCK A, Car B',
          depart_time: '3:00 PM',
          return_time: '9:00 PM',
          staff_requested: 8,
          staff_assigned: 6,
          oef: '1.77',
          staff_with_roles: ['CS - Dwight Schrute', 'DS - Parm Beesly'],
          created_at: '2023-09-22',
          created_by: 1,
        },
      ],
    };

    findAllFilteredData = {
      status: 'success',
      response: '',
      code: 200,
      record_count: 2,
      data: [
        {
          id: 1,
          account_name: 'Ram Beesly',
          location_name: 'Gymnasilum - Room 456',
          location_address: 'Metro, TX',
          sum_of_procedure_shifts: 40,
          sum_of_product_shifts: 50,
          date: '2023-08-21',
          shift_start_time: '2:00 PM',
          shift_end_time: '6:00 PM',
          vehicles: 'TRUCK A, Car B',
          depart_time: '3:00 PM',
          return_time: '9:00 PM',
          staff_requested: 8,
          staff_assigned: 6,
          oef: '1.77',
          staff_with_roles: ['CS - Dwight Schrute', 'DS - Parm Beesly'],
          created_at: '2023-09-21',
          created_by: 1,
        },
      ],
    };
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get Departure schedules', () => {
    it('it should forbid access to resources for user without STAFFING_MANAGEMENT_VIEW_SCHEDULE_STAFF_SCHEDULE permissions', async () => {
      const { status } = await supertest
        .agent(app.getHttpServer())
        .get('/view-schedules/departure-schedules')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${access_token}`)
        .expect('Content-Type', /json/);

      expect(status).toEqual(403);
    });

    it('should fetch departure schedules with the correct parameters', async () => {
      jest.spyOn(service, 'findAllFiltered').mockResolvedValue(findAllData);
      const filter: GetAllDepartFilteredInterface = {
        keyword: '',
        page: 1,
        limit: 10,
        staff_id: null,
        team_id: null,
        collection_operation_id: null,
        schedule_start_date: null,
        schedule_status_id: null,
        donor_id: null,
      };
      const result = await controller.findAllFiltered(filter, null);

      expect(result).toEqual(findAllData);
      expect(service.findAllFiltered).toHaveBeenCalledWith(filter);
    });
  });

  describe('Search Departure Schedules', () => {
    it('should fetch searched data with the correct parameters', async () => {
      const filter: GetAllDepartFilteredInterface = {
        keyword: 'Ram Beesly',
        page: 1,
        limit: 10,
        staff_id: null,
        team_id: null,
        collection_operation_id: null,
        schedule_start_date: null,
        schedule_status_id: null,
        donor_id: null,
      };

      jest
        .spyOn(service, 'findAllFiltered')
        .mockResolvedValue(findAllFilteredData);
      const result = await controller.findAllFiltered(filter, null);

      expect(result).toEqual(findAllFilteredData);
      expect(service.findAllFiltered).toHaveBeenCalledWith(filter);
    });
  });

  describe('Search Departure Schedules', () => {
    it('should fetch searched data with the correct parameters', async () => {
      const filter: GetAllDepartFilteredInterface = {
        keyword: '',
        page: 1,
        limit: 10,
        staff_id: 1,
        team_id: null,
        collection_operation_id: null,
        schedule_start_date: null,
        schedule_status_id: null,
        donor_id: null,
      };

      jest
        .spyOn(service, 'findAllFiltered')
        .mockResolvedValue(findAllFilteredData);
      const result = await controller.findAllFiltered(filter, null);

      expect(result).toEqual(findAllFilteredData);
      expect(service.findAllFiltered).toHaveBeenCalledWith(filter);
    });
  });
});
