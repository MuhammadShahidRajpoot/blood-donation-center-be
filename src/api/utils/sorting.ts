const customSort = (query) => {
  const sort: any = {}; // Use 'any' to allow dynamic property names
  if (query.sortName) {
    sort[query.sortName] = query?.sortOrder === 'DESC' ?? 'ASC';
  }

  return sort;
};

export { customSort };
