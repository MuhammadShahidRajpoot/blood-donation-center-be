import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { BecsRaces } from '../crm/contacts/donor/entities/becs-race.entity';
import { BloodGroups } from '../crm/contacts/donor/entities/blood-group.entity';
import './seed-donor.json';
// import { User } from '../system-configuration/tenants-administration/user-administration/user/entity/user.entity';

@Injectable()
export class DonorsSeed implements Seeder {
  constructor(
    @InjectRepository(BecsRaces)
    private readonly becsRacesRepository: Repository<BecsRaces>,
    @InjectRepository(BloodGroups)
    private readonly bloodGroupsRepository: Repository<BloodGroups> // @InjectRepository(User) // private readonly userRepository: Repository<User>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const filePath = path.join(__dirname, './seed-donor.json');
    const dataFile = fs.readFileSync(filePath);
    const parsedData = JSON.parse(dataFile);

    const bloodGroupsData = parsedData?.blood_groups;
    const becsRacesData = parsedData?.becs_races;
    try {
      for (const data of bloodGroupsData) {
        // const user = await this.userRepository.findOne({
        //   where: {
        //     id: data?.created_by,
        //   },
        // });
        // if (!user) {
        //   throw new Error(`User with id ${data?.created_by} not found.`);
        // }

        const existingRecord = await this.bloodGroupsRepository.findOne({
          where: {
            becs_name: data?.becs_name,
          },
        });

        if (!existingRecord) {
          const bloodGroup = new BloodGroups();
          bloodGroup.name = data?.name;
          bloodGroup.becs_name = data?.becs_name;
          bloodGroup.becs_system = data?.becs_system;
          bloodGroup.created_by = data?.created_by; // user

          await this.bloodGroupsRepository.save(bloodGroup);
        }
      }
      console.log('Donor Blood Group Seeder Completed');

      for (const data of becsRacesData) {
        // const user = await this.userRepository.findOne({
        //   where: {
        //     id: data?.created_by,
        //   },
        // });
        // if (!user) {
        //   throw new Error(`User with id ${data?.created_by} not found.`);
        // }

        const existingRecord = await this.becsRacesRepository.findOne({
          where: {
            becs_code: data?.becs_code,
          },
        });

        if (!existingRecord) {
          const becsRace = new BecsRaces();
          becsRace.name = data?.name;
          becsRace.becs_code = data?.becs_code;
          becsRace.becs_system = data?.becs_system;
          becsRace.created_by = data?.created_by; // user

          await this.becsRacesRepository.save(becsRace);
        }
      }

      console.log('Becs Races Seeder Completed');
    } catch (err) {
      console.log(err);
    }
  }

  async drop(): Promise<any> {
    try {
    } catch (e) {
      console.error('error seeding db : ', e);
    }
  }
}
