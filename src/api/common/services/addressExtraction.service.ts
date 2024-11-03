export async function addressExtractionFilter(
  type: string,
  id: any,
  response: any,
  userId: any,
  city: any,
  state: any,
  country: any,
  repo: any,
  county: any = null,
  tenant_id: any = null
): Promise<any[]> {
  if (id.length > 0) {
    if (city || state || country || county) {
      const modifiedData = [];
      const cityFilter = city
        ? `city ILIKE ANY(ARRAY[${city
            .split(',')
            .map((c) => `'${c.trim()}'`)}]) AND `
        : '';
      const stateFilter = state
        ? `state ILIKE ANY(ARRAY[${state
            .split(',')
            .map((c) => `'${c.trim()}'`)}]) AND `
        : '';
      const countyFilter = county
        ? `county ILIKE ANY(ARRAY[${county
            .split(',')
            .map((c) => `'${c.trim()}'`)}]) AND `
        : '';
      const abcFilter = `${cityFilter} 
      ${stateFilter}
      ${countyFilter}
      ${country !== null ? `country ILIKE '%${country}%' AND ` : ''}`;

      const query = `
       SELECT *
        FROM address
        WHERE
          ${abcFilter}
          addressable_id IN (${id})
          AND addressable_type = '${type}'
          ORDER BY address.id DESC;`;
      const insert = await repo.query(query);

      for (const res of response) {
        const matchingAddress = insert.find(
          (instance: any) => res?.id === instance?.addressable_id
        );
        if (matchingAddress) {
          modifiedData.push({
            ...res,
            address: matchingAddress,
          });
        }
      }
      return modifiedData;
    } else {
      const modifiedData = [];
      const query = `
       SELECT *
        FROM address
        Where addressable_id IN (${id}) 
        AND addressable_type =  '${type}'
        ORDER BY address.id DESC`;
      const insert = await repo.query(query);
      for (const res of response) {
        const matchingAddress = insert.find(
          (instance: any) => res?.id === instance?.addressable_id
        );
        if (matchingAddress) {
          modifiedData.push({
            ...res,
            address: tenant_id
              ? {
                  ...matchingAddress,
                  coordinates: { ...matchingAddress.coordinates, tenant_id },
                  tenant_id,
                }
              : matchingAddress,
          });
        }
      }
      return modifiedData;
    }
  }
}
