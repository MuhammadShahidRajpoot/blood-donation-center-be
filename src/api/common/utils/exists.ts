import { HttpException, HttpStatus } from '@nestjs/common';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

export async function isExists<T>(
  id: string,
  repository: Repository<T>,
  message?: string,
  andWhere?: FindOptionsWhere<T>,
  relations?: FindOptionsRelations<T>
): Promise<T> {
  const where: FindOptionsWhere<T> = <any>{
    id,
    is_archived: false,
    ...(andWhere || {}),
  };
  const entity = await repository.findOne({ where, relations });
  if (!entity) {
    throw new HttpException(
      message || `${repository.metadata.name} not found.`,
      HttpStatus.NOT_FOUND
    );
  }
  return entity;
}

export async function isExistMultiple<T>(
  ids: string[],
  repository: Repository<T>,
  message?: string,
  andWhere?: FindOptionsWhere<T>,
  relations?: FindOptionsRelations<T>,
  order?: FindOptionsOrder<T>
): Promise<T[]> {
  if (!ids.length) return [];
  const where: FindOptionsWhere<T> = <any>{
    id: In(ids),
    is_archived: false,
    ...(andWhere || {}),
  };
  const entitys = await repository.find({ where, relations, order });
  if (entitys.length !== ids.length) {
    throw new HttpException(
      message || `${repository.metadata.name} some are not found`,
      HttpStatus.NOT_FOUND
    );
  }
  return entitys;
}
