export async function getModifiedDataDetails(
  historyRepository: any,
  id: number,
  userRepository: any,
  tenant_id?
): Promise<any[]> {
  let userData: any;
  const results = await historyRepository.findOne({
    where: { id },
    select: ['id', 'created_at', 'created_by'],
    order: {
      rowkey: 'ASC',
    },
  });
  if (results) {
    userData = await userRepository.findOne({
      where: {
        id: results?.created_by,
        is_archived: false,
      },
      relations: ['tenant'],
    });
  }
  const { tenant, ...rest } = userData || {};
  let created_by = null;
  if (tenant?.has_superadmin || !results?.created_by) {
    created_by = {
      ...rest,
      tenant_id,
    };
  } else {
    created_by = {
      ...rest,
    };
  }
  const data: any = {
    created_by: userData ? created_by : null,
    created_at: results?.created_at ? results?.created_at : null,
  };
  //   return results;
  return data;
}
