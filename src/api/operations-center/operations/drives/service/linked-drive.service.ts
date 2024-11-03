import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from '../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { LinkDriveDto } from '../dto/drives-contact.dto';
import { LinkedDrives } from '../entities/linked-drives.entity';
import { LinkedDrivesHistory } from '../entities/linked-drives-history.entity';
import { Drives } from '../entities/drives.entity';
dotenv.config();

@Injectable()
export class LinkedDriveService {
  constructor(
    @InjectRepository(LinkedDrives)
    private readonly linkDriveRepository: Repository<LinkedDrives>,
    @InjectRepository(LinkedDrivesHistory)
    private readonly linkDriveHistoryRepository: Repository<LinkedDrivesHistory>,
    @InjectRepository(Drives)
    private readonly driveRepository: Repository<Drives>
  ) {}

  async createLinkedDrives(id: any, user: User, linkDriveDto: LinkDriveDto) {
    try {
      const deletePromises = [];
      const historyPromises = [];
      let savedLinkedDrive: any;
      if (linkDriveDto?.deleteLinkedDrive?.length > 0) {
        for (const item of linkDriveDto.deleteLinkedDrive) {
          const where: any = {
            prospective_drive_id: { id: item },
            current_drive_id: { id: id },
            is_archived: false,
          };
          const link_drive: any = await this.linkDriveRepository.findOne({
            where: where,
            relations: [
              'created_by',
              'prospective_drive_id',
              'current_drive_id',
            ],
          });

          link_drive.is_archived = true;
          link_drive.created_at = new Date();
          link_drive.created_by = user;
          deletePromises.push(this.linkDriveRepository.save(link_drive));
        }
        const driveToLink: any = await this.driveRepository.findOne({
          where: { id: id },
        });
        driveToLink.is_linked = false;
        driveToLink.created_at = new Date();
        driveToLink.created_by = user;
        this.driveRepository.save(driveToLink);
        const idToProspectiveDrive: any = linkDriveDto.deleteLinkedDrive[0];
        const prospective_drive: any = await this.driveRepository.findOne({
          where: { id: idToProspectiveDrive },
        });
        prospective_drive.is_linkable = true;
        prospective_drive.created_at = new Date();
        prospective_drive.created_by = user;
        this.driveRepository.save(prospective_drive);
        await Promise.all(historyPromises);
        await Promise.all(deletePromises);
        savedLinkedDrive = [];
      }
      const promises = [];
      if (linkDriveDto?.linkDrive?.length > 0) {
        for (const element of linkDriveDto.linkDrive) {
          const linkDrive = new LinkedDrives();
          linkDrive.is_archived = false;
          linkDrive.created_by = user;
          linkDrive.current_drive_id = id;
          linkDrive.prospective_drive_id = element?.drive_id;
          promises.push(this.linkDriveRepository.save(linkDrive));
        }
        savedLinkedDrive = await Promise.all(promises);

        const driveToLink: any = await this.driveRepository.findOne({
          where: { id: id },
        });
        driveToLink.is_linked = true;
        driveToLink.created_at = new Date();
        driveToLink.created_by = user;
        this.driveRepository.save(driveToLink);
        const prospective_drive: any = await this.driveRepository.findOne({
          where: { id: linkDriveDto.linkDrive[0].drive_id },
        });
        prospective_drive.is_linkable = false;
        prospective_drive.created_at = new Date();
        prospective_drive.created_by = user;
        this.driveRepository.save(prospective_drive);
      }
      return resSuccess(
        'Drive linked',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedLinkedDrive
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
