import { In, Repository } from 'typeorm';
import { UserBusinessUnits } from './entity/user-business-units.entity';
import { BusinessUnits } from '../../organizational-administration/hierarchy/business-units/entities/business-units.entity';

export const userBusinessUnitHierarchy = async (
  userId: bigint,
  userBusinessUnitsRepository: Repository<UserBusinessUnits>,
  businessUnitsRepository: Repository<BusinessUnits>,
  auto_created_role = false,
  tenant_id
) => {
  let userBusinessUnits = [];
  if (auto_created_role) {
    userBusinessUnits = await businessUnitsRepository.find({
      where: {
        tenant_id,
        is_archived: false,
      },
    });
  } else {
    userBusinessUnits = await userBusinessUnitsRepository.find({
      where: {
        tenant_id,
        user_id: <any>{
          id: userId,
        },
        is_archived: false,
      },
      relations: ['business_unit_id', 'user_id'],
    });
  }
  if (userBusinessUnits.length > 0) {
    let allBusinessUnits: BusinessUnits[];
    let newBusinessUnits = [];
    if (auto_created_role) {
      allBusinessUnits = <any[]>userBusinessUnits.map((item) => item);
      newBusinessUnits = [...allBusinessUnits];
    } else {
      allBusinessUnits = <any[]>(
        userBusinessUnits.map((item) => item.business_unit_id)
      );
      newBusinessUnits = [...allBusinessUnits];
    }

    while (newBusinessUnits.length > 0) {
      const childBusinessUnits = await businessUnitsRepository.find({
        where: {
          parent_level: In(newBusinessUnits.map((bu) => bu.id)),
          is_archived: false,
        },
      });

      newBusinessUnits = childBusinessUnits.filter(
        (bu) => !allBusinessUnits.some((existingBU) => existingBU.id === bu.id)
      );
      allBusinessUnits = [...allBusinessUnits, ...newBusinessUnits];
    }
    return allBusinessUnits;
  }
};
