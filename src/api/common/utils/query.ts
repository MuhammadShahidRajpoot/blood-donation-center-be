import { EntityManager, SelectQueryBuilder } from 'typeorm';

/**
 * The function `getRawCount` takes an EntityManager and a SelectQueryBuilder, executes the query and
 * returns the count of the results.
 * @param {EntityManager} manager - The `manager` parameter is an instance of the `EntityManager`
 * class. It is responsible for managing the connection and executing queries against the database.
 * @param query - The `query` parameter is a `SelectQueryBuilder<T>` object, which represents a query
 * to be executed. It is used to build and execute SQL SELECT queries.
 * @returns The function `getRawCount` returns a promise that resolves to a number.
 */
export const getRawCount = async <T>(
  manager: EntityManager,
  query: SelectQueryBuilder<T>
): Promise<number> => {
  const [queryStr, queryParams] = query.getQueryAndParameters();
  const result = await manager.query(
    `SELECT COUNT(*)::int FROM (${queryStr}) AS sub;`,
    queryParams
  );
  return result?.length ? result[0]?.count : 0;
};
