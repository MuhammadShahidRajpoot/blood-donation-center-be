import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Not, ILike } from 'typeorm';
import { Products } from '../../products/entities/products.entity';
import {
  CreateProceduresDto,
  UpdateProceduresDto,
} from '../dto/create-procedures.dto';
import { ProcedureTypes } from '../../procedure-types/entities/procedure-types.entity';
import { Procedure } from '../entities/procedure.entity';
import { ProceduresProducts } from '../entities/procedures-products.entity';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import { resError } from '../../../../../../system-configuration/helpers/response';
import { User } from '../../../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { GetAllProcedureInterface } from '../interface/procedure.interface';
import { ProcedureHistory } from '../entities/procedures-history.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class ProcedureService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    @InjectRepository(Procedure)
    private readonly proceduresRepository: Repository<Procedure>,
    @InjectRepository(ProcedureHistory)
    private readonly proceduresHistoryRepository: Repository<ProcedureHistory>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(ProceduresProducts)
    private readonly procedureProductsRepository: Repository<ProceduresProducts>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {}

  async create(createProcedureDto: CreateProceduresDto, tenant_id: bigint) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepository.findOneBy({
        id: createProcedureDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const procedure_type = await this.procedureTypesRepository.findOneBy({
        id: createProcedureDto?.procedure_type_id,
      });
      if (!procedure_type) {
        return resError(
          `Procedure Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const nameCheck = await this.proceduresRepository.findOneBy({
        name: createProcedureDto?.name,
        tenant_id: tenant_id,
        is_archive: false,
      });
      if (nameCheck) {
        return resError(
          `Name already exist.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      for (const product of createProcedureDto.procedure_products) {
        // Validate product_id
        if (!product.product_id || typeof product.product_id !== 'number') {
          throw new BadRequestException('Invalid product_id');
        }

        // Check if the product ID exists in the database
        const existingProduct = await this.productsRepository.findOneBy({
          id: product.product_id,
        });
        if (!existingProduct) {
          throw new BadRequestException(
            `Product with ID ${product.product_id} not found`
          );
        }

        // Validate quantity
        if (
          !product.quantity ||
          typeof product.quantity !== 'number' ||
          product.quantity <= 0
        ) {
          throw new BadRequestException('Invalid quantity');
        }
      }

      // Create the Procedure
      const procedure = new Procedure();
      // // Set Procedure Types properties from createProcedureTypes
      procedure.name = createProcedureDto.name;
      procedure.description = createProcedureDto.description;
      procedure.is_active = createProcedureDto?.is_active;
      procedure.created_by = createProcedureDto?.created_by;
      procedure.external_reference = createProcedureDto?.external_reference;
      procedure.procedure_type_id = createProcedureDto?.procedure_type_id;
      procedure.tenant_id = tenant_id;
      procedure.credits = createProcedureDto?.credits;

      // Save the Procedure Types entity
      const savedProcedure = await queryRunner.manager.save(procedure);
      await queryRunner.commitTransaction();
      const savedProcedureId = BigInt(savedProcedure.id);

      // Create and format the ProceduresProducts entities
      const proceduresProducts: ProceduresProducts[] =
        createProcedureDto.procedure_products.map((item) => {
          const procedureProduct = new ProceduresProducts();
          procedureProduct.quantity = item.quantity;
          procedureProduct.procedures_id = savedProcedureId;
          procedureProduct.product_id = item.product_id;
          return procedureProduct;
        });

      // Save the ProceduresProducts entities in the bridge table
      await this.procedureProductsRepository.insert(proceduresProducts);

      return {
        status: 'success',
        message: 'Procedure Created Successfully',
        status_code: 201,
        data: savedProcedure,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    getAllProcedureInterface: GetAllProcedureInterface,
    tenant_id: bigint
  ): Promise<any> {
    try {
      const sortName = getAllProcedureInterface?.sortName;
      const sortBy = getAllProcedureInterface?.sortOrder;

      if ((sortName && !sortBy) || (sortBy && !sortName)) {
        return resError(
          `When selecting sort SortBy & SortName is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const limit: number = getAllProcedureInterface?.limit
        ? +getAllProcedureInterface?.limit
        : +process.env.PAGE_SIZE;

      let page = getAllProcedureInterface?.page
        ? +getAllProcedureInterface?.page
        : 1;

      if (page < 1) {
        page = 1;
      }

      const where = { tenant_id };
      if (getAllProcedureInterface?.name) {
        page = 1;
        Object.assign(where, {
          name: ILike(`%${getAllProcedureInterface?.name}%`),
        });
      }

      if (getAllProcedureInterface?.status) {
        Object.assign(where, {
          is_active: getAllProcedureInterface?.status,
        });
      }

      Object.assign(where, {
        is_archive: false,
      });

      const procedure = this.proceduresRepository
        .createQueryBuilder('procedure')
        .leftJoinAndSelect('procedure.procedure_products', 'procedure_products')
        .leftJoinAndSelect(
          'procedure_products.products',
          'procedure_products_products'
        )
        .leftJoinAndSelect('procedure.procedure_type_id', 'procedure_type_id')
        .leftJoinAndSelect('procedure_type_id.products', 'products')
        .skip((page - 1) * limit)
        .take(limit)
        // .limit(limit)
        .where(where);

      if (sortName && sortName != 'procedure_type_id') {
        procedure.orderBy(`procedure.${sortName}`, sortBy as 'ASC' | 'DESC');
      } else if (sortName == 'procedure_type_id') {
        procedure.orderBy(`procedure_type_id.name`, sortBy as 'ASC' | 'DESC');
      } else {
        procedure.orderBy('procedure.id', 'DESC'); // Set default sorting to descending by ID
      }

      const countQuery = procedure;

      if (getAllProcedureInterface?.goal_type) {
        procedure.andWhere('procedure_type_id.is_goal_type = :is_goal_type', {
          is_goal_type: getAllProcedureInterface?.goal_type,
        });
      }

      const data = await procedure.getMany();

      const count = await countQuery.getCount();
      return {
        status: HttpStatus.OK,
        message: 'Procedures Fetched Succesfuly',
        count: count,
        data: data,
      };
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: any, req): Promise<any> {
    try {
      const procedure: any = await this.proceduresRepository.findOne({
        where: { id: id, tenant_id: req.user.tenant.id },
        relations: [
          'procedure_type_id.products',
          'procedure_products.products',
          'created_by',
        ],
      });
      if (!procedure) {
        return resError(
          `Procedure not found`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (procedure) {
        const modifiedData: any = await getModifiedDataDetails(
          this.proceduresHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        procedure.modified_by = procedure.created_by;
        procedure.modified_at = procedure.created_at;
        procedure.created_at = modified_at ? modified_at : procedure.created_at;
        procedure.created_by = modified_by ? modified_by : procedure.created_by;
      }
      const procedureWithTenantId = {
        ...procedure,
        procedure_products: procedure.procedure_products.map((product) => ({
          ...product,
          tenant_id: procedure.tenant_id,
        })),
      };
      return {
        status: HttpStatus.OK,
        message: 'Procedure Fetched Succesfuly',
        data: { ...procedureWithTenantId },
      };
    } catch (err) {
      console.log(err);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: any, updateProceduresDto: UpdateProceduresDto, req) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if tenant_name already exists with a different tenant ID
      const existingProcedureWithName = await this.proceduresRepository.findOne(
        {
          where: {
            name: updateProceduresDto.name,
            id: Not(id),
            tenant_id: updateProceduresDto?.updated_by,
          },
        }
      );
      if (existingProcedureWithName) {
        return resError(
          `Procedure with the same name already exists.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const procedure: any = await this.proceduresRepository.findOneBy({
        id: id,
      });

      if (!procedure) {
        return resError(
          `Procedure not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const procedureType = await this.procedureTypesRepository.findOneBy({
        id: updateProceduresDto?.procedure_type_id,
      });

      if (!procedureType) {
        return resError(
          `Procedure Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: updateProceduresDto?.created_by,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      for (const product of updateProceduresDto?.procedure_products) {
        // Validate product_id
        if (!product.product_id || typeof product.product_id !== 'number') {
          throw new BadRequestException('Invalid product_id');
        }

        // Check if the product ID exists in the database
        const existingProduct = await this.productsRepository.findOneBy({
          id: product.product_id,
        });
        if (!existingProduct) {
          throw new BadRequestException(
            `Product with ID ${product.product_id} not found`
          );
        }

        // Validate quantity
        if (
          !product.quantity ||
          typeof product.quantity !== 'number' ||
          product.quantity <= 0
        ) {
          throw new BadRequestException('Invalid quantity');
        }
      }

      procedure.name = updateProceduresDto.name;
      procedure.description = updateProceduresDto.description;
      procedure.is_active = updateProceduresDto?.is_active;
      // procedure.created_by = updateProceduresDto?.created_by;
      procedure.created_by = this?.request?.user;
      procedure.external_reference = updateProceduresDto?.external_reference;
      procedure.procedure_type_id = updateProceduresDto?.procedure_type_id;
      procedure.credits = updateProceduresDto?.credits;
      procedure.created_at = new Date();

      const updatedProcedure = await this.proceduresRepository.save(procedure);

      //delete if there no procedure products in update request
      // if(UpdateProceduresDto?.procedure_products.length <= 0)
      // {
      await this.procedureProductsRepository
        .createQueryBuilder('procedures_products')
        .delete()
        .from('procedures_products')
        .where('procedures_id = :procedures_id', { procedures_id: id })
        .execute();
      // }

      // Create and format the ProceduresProducts entities
      const proceduresProducts: ProceduresProducts[] =
        updateProceduresDto.procedure_products.map((item) => {
          const procedureProduct = new ProceduresProducts();
          procedureProduct.quantity = item.quantity;
          procedureProduct.procedures_id = id;
          procedureProduct.product_id = item.product_id;
          return procedureProduct;
        });
      // Save the ProceduresProducts entities in the bridge table
      await this.procedureProductsRepository.insert(proceduresProducts);

      await queryRunner.commitTransaction();

      console.log();
      return {
        status: 'Success',
        message: 'Changes Saved.',
        status_code: HttpStatus.NO_CONTENT,
        data: { tenant_id: req?.user?.tenant?.id },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async updateProcedureHistory(data: any, action: string) {
    const ProcedureC = new ProcedureHistory();
    ProcedureC.id = data?.id;
    ProcedureC.name = data.name;
    ProcedureC.description = data.description;
    ProcedureC.is_active = data?.is_active;
    ProcedureC.created_by = data?.created_by;
    ProcedureC.external_reference = data?.external_reference;
    ProcedureC.procedure_type_id = data?.procedure_type_id;
    ProcedureC.history_reason = 'C';
    ProcedureC.tenant_id = data.tenant_id;
    await this.proceduresHistoryRepository.save(ProcedureC);

    if (action === 'D') {
      const ProcedureD = new ProcedureHistory();
      ProcedureC.id = data?.id;
      ProcedureC.name = data.name;
      ProcedureC.description = data.description;
      ProcedureC.is_active = data?.is_active;
      ProcedureC.created_by = data?.created_by;
      ProcedureC.external_reference = data?.external_reference;
      ProcedureC.procedure_type_id = data?.procedure_type_id;
      ProcedureD.history_reason = 'D';
      ProcedureD.tenant_id = data.tenant_id;
      await this.proceduresHistoryRepository.save(ProcedureD);
    }
  }

  async archive(id: any, updatedBy: any) {
    try {
      const procedure = await this.proceduresRepository.findOneBy({
        id: id,
      });

      // let procedure = await this.proceduresRepository.findOne({
      //   where : {id: id},
      //   relations: ['procedure_type_id','created_by']
      // });

      if (!procedure) {
        return resError(
          `Procedure not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const isArchive = !procedure.is_archive;
      const updatedRequest: any = {
        ...procedure,
        is_archive: isArchive,
        created_by: this?.request?.user,
        created_at: new Date(),
      };

      // return updatedRequest;
      const updatedProcedure = await this.proceduresRepository.save(
        updatedRequest
      );
      delete updatedProcedure.created_by;

      return {
        status: 'Success',
        message: 'Changes Saved.',
        status_code: HttpStatus.NO_CONTENT,
        data: null,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
