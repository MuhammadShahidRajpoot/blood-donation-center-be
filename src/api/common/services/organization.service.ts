import { Brackets } from 'typeorm';

interface ResourceFilter {
  recruiters?: string[];
  donor_centers?: string[];
}

interface CollectionOperationFilter {
  [index: string]: ResourceFilter;
}

interface OLFilter extends ResourceFilter {
  collection_operations?: CollectionOperationFilter;
}

/**
 * The `organizationalLevelWhere` function only works with queries written using *QueryBuilder*,
 * it takes in a filter and column names, and returns a query condition using the filter and column values.
 * @param {string} filter - The `filter` parameter is a string that represents a JSON object. It
 * contains the filter criteria for the organizational level.
 * @param {string} coColumn - The `coColumn` parameter is a string that represents the column name for
 * the collection operation in the database table.
 * @param {string} [recruiterColumn] - The `recruiterColumn` parameter is a string that represents the
 * column name in the database table where the recruiter information is stored.
 * @param {string} [donorCenterColumn] - The `donorCenterColumn` parameter is a string that represents
 * the column name in the database table where the donor center information is stored.
 * @returns The function `organizationalLevelWhere` returns an instance of the `Brackets` class.
 */
export const organizationalLevelWhere = (
  filter: string,
  coColumn: string,
  recruiterColumn?: string,
  donorCenterColumn?: string
): Brackets => {
  const olFilter: OLFilter = JSON.parse(filter);
  return new Brackets((qb) => {
    Object.entries(olFilter?.collection_operations || []).forEach(
      ([co_id, resource], index) => {
        const { recruiters, donor_centers } = resource;
        const condition = `(${coColumn} = :co_id${index} ${
          recruiters?.length && recruiterColumn
            ? `AND ${recruiterColumn} IN (:...recruiters${index})`
            : ''
        } ${
          donor_centers?.length && donorCenterColumn
            ? `AND ${donorCenterColumn} IN (:...donor_centers${index})`
            : ''
        })`;
        const params = {
          [`co_id${index}`]: co_id,
          [`recruiters${index}`]: recruiters,
          [`donor_centers${index}`]: donor_centers,
        };
        if (!index) qb.where(condition, params);
        else qb.orWhere(condition, params);
      }
    );
    if (olFilter?.recruiters?.length && recruiterColumn) {
      qb.orWhere(`${recruiterColumn} IN (:...recruiters)`, {
        recruiters: olFilter.recruiters,
      });
    }
    if (olFilter?.donor_centers?.length && donorCenterColumn) {
      qb.orWhere(`${donorCenterColumn} IN (:...donor_centers)`, {
        donor_centers: olFilter.donor_centers,
      });
    }
  });
};

/**
 * The function `organizationalLevelWhereString` only works with queries written using *RawSQL*,
 * generates a SQL WHERE clause based on the provided filter object and columns for
 * collection operations, recruiters, and donor centers.
 * @param {string} filter - The `filter` parameter is a JSON string that contains information about
 * organizational levels and their associated resources like recruiters and donor centers. This
 * function parses the JSON string and constructs a SQL WHERE clause based on the provided columns and
 * filter criteria. The function then returns the constructed WHERE clause as a string.
 * @param {string} coColumn - It represents the column that contains the organizational level identifier.
 * This identifier is used to filter the data based on the organizational level specified
 * in the `filter` parameter.
 * @param {string} [recruiterColumn] - It is used to specify the column in the database table that
 * contains recruiter information. This column is used to filter the data based on the recruiters
 * associated with a particular organizational level.
 * @param {string} [donorCenterColumn] - It represents the column in the database that contains
 * information about donor centers. This parameter is optional, meaning it may or may not be provided
 * when calling the function. If provided, it is used to filter the results based
 * @returns returns a string that represents the filter conditions based on the input parameters and
 * the parsed `OLFilter` object. The function constructs a WHERE clause for SQL queries based on the
 * provided filter criteria for collection operations, recruiters, and donor centers.
 */
export const organizationalLevelWhereString = (
  filter: string,
  coColumn: string,
  recruiterColumn?: string,
  donorCenterColumn?: string
): string => {
  const olFilter: OLFilter = JSON.parse(filter);
  const collection_operations = Object.entries(
    olFilter?.collection_operations || []
  );
  let where = '';

  collection_operations.forEach(([co_id, resource], index) => {
    const { recruiters, donor_centers } = resource;
    const condition = `(${coColumn} = ${co_id}${
      recruiters?.length && recruiterColumn
        ? ` AND ${recruiterColumn} IN (${recruiters.join(',')})`
        : ''
    }${
      donor_centers?.length && donorCenterColumn
        ? ` AND ${donorCenterColumn} IN (${donor_centers.join(',')})`
        : ''
    })`;
    where += !index ? `${condition}` : ` OR ${condition}`;
  });
  if (olFilter?.recruiters?.length && recruiterColumn) {
    where += where ? ' OR ' : '';
    where += `${recruiterColumn} IN (${olFilter.recruiters.join(',')})`;
  }
  if (olFilter?.donor_centers?.length && donorCenterColumn) {
    where += where ? ' OR ' : '';
    where += `${donorCenterColumn} IN (${olFilter.donor_centers.join(',')})`;
  }
  return where;
};
