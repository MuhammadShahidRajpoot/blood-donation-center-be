import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, IsNull, In } from 'typeorm';
import { ErrorConstants } from '../../../system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from '../../../system-configuration/helpers/response';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { ManageScripts } from '../entities/manage-scripts.entity';
import { ManageScriptsHistory } from '../entities/manage-scripts-history.entity';
import { ManageScriptsDto } from '../dto/manage-scripts.dto';
import { S3Service } from 'src/api/crm/contacts/common/s3.service';
import { GetAllCallScriptsInterface } from '../interface/manage-scripts.interface';
import { GenericAttachmentsFiles } from 'src/api/common/entities/generic_attachment_file.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import ffmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path; // eslint-disable-line
import { CallJobsCallScripts } from '../../call-schedule/call-jobs/entities/call-jobs-call-scripts.entity';

@Injectable()
export class ManageScriptsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(ManageScripts)
    private readonly manageScriptsRepository: Repository<ManageScripts>,
    @InjectRepository(CallJobsCallScripts)
    private readonly callJobsCallScriptsRepository: Repository<CallJobsCallScripts>,
    @InjectRepository(ManageScriptsHistory)
    private readonly manageScriptsHistoryRepository: Repository<ManageScriptsHistory>,
    @InjectRepository(GenericAttachmentsFiles)
    private readonly genericAttachmentFilesRepository: Repository<GenericAttachmentsFiles>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
    private readonly entityManager: EntityManager
  ) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  async convertToMp3(file: Express.Multer.File): Promise<PassThrough> {
    const passThrough = new PassThrough();

    await new Promise<void>((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      ffmpeg(readableStream)
        .audioCodec('libmp3lame')
        .toFormat('mp3')
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          console.error('Error converting file:', err);
          reject(err);
        })
        .pipe(passThrough, { end: true });
    });

    return passThrough;
  }

  async create(
    file: Express.Multer.File,
    createManageScriptsDto: ManageScriptsDto,
    user: any
  ) {
    try {
      const manageScript: any = new ManageScripts();
      manageScript.name = createManageScriptsDto.name;
      manageScript.script = createManageScriptsDto.script;
      manageScript.is_active = createManageScriptsDto.is_active;
      manageScript.script_type = createManageScriptsDto.script_type;
      manageScript.tenant_id = user.tenant.id;
      // manageScript.created_at = new Date();=  new Date();
      manageScript.created_at = new Date();
      manageScript.created_by = user.id;
      manageScript.is_archived = false;
      manageScript.is_voice_recording =
        createManageScriptsDto.is_voice_recording;
      manageScript.is_recorded_message =
        createManageScriptsDto.is_recorded_message;

      const savedManageScript = await this.manageScriptsRepository.save(
        manageScript
      );

      let attachmentFile;

      if (createManageScriptsDto.is_voice_recording && file) {
        const passThrough = await this.convertToMp3(file);
        const attachmentPath = await this.s3Service.uploadScriptRecordingToS3(
          passThrough,
          savedManageScript.id.toString()
        );

        const genericAttachment: any = new GenericAttachmentsFiles();
        genericAttachment.attachment_id = savedManageScript.id;
        genericAttachment.attachment_path = attachmentPath;
        genericAttachment.created_at = new Date();
        genericAttachment.created_by = user.id;
        genericAttachment.attachment_name = file.originalname;
        genericAttachment.tenant_id = user.tenant.id;

        attachmentFile = await this.genericAttachmentFilesRepository.save(
          genericAttachment
        );
      }

      return resSuccess(
        'Manage Script Created Successfully',
        'success',
        HttpStatus.CREATED,
        {
          savedManageScript,
          attachmentFile,
          tenant_id: savedManageScript.tenant_id,
        }
      );
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async paginateAndSort(data: any[], page: number, limit: number, sortOrder) {
    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.last_update as string);
      const dateB = new Date(b.last_update as string);

      if (sortOrder === 'ASC') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return sortedData.slice(startIndex, endIndex);
  }

  async getAll(params: GetAllCallScriptsInterface, user: any) {
    try {
      const sortName = params?.sortName === '' ? undefined : params?.sortName;
      const sortBy = params?.sortOrder === 'DESC' ? 'DESC' : 'ASC';
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;
      let page = params?.page ? +params?.page : 1;
      if (page < 1) {
        page = 1;
      }

      const where = {};
      if (params?.name) {
        Object.assign(where, {
          name: ILike(`%${params?.name}%`),
        });
      }

      if (params?.is_active) {
        Object.assign(where, {
          is_active: params?.is_active,
        });
      }

      if (params?.hasVM) {
        Object.assign(where, {
          is_voice_recording: params?.hasVM,
        });
      }

      if (params?.script_type) {
        const scriptTypesArray: any = params.script_type;
        const scriptTypes = scriptTypesArray.split(',');
        Object.assign(where, {
          script_type: In(scriptTypes),
        });
      }

      Object.assign(where, {
        tenant_id: { id: user?.tenant?.id },
      });

      const queryBuilder = this.manageScriptsRepository
        .createQueryBuilder('manage_script')
        .leftJoinAndSelect('manage_script.tenant_id', 'tenant')
        .addSelect('tenant.id', 'tenant_id')
        .where({
          ...where,
          is_archived: false,
        });
      if (sortName && sortName !== 'last_update') {
        queryBuilder.orderBy(`manage_script.${sortName}`, sortBy);
      } else {
        queryBuilder.orderBy({ 'manage_script.id': 'DESC' });
      }

      if (!params?.fetchAll && sortName !== 'last_update') {
        queryBuilder.take(limit).skip((page - 1) * limit);
      }

      const [data, count] = await queryBuilder.getManyAndCount();

      if (sortName === 'script_type') {
        data.sort((a, b) => {
          const aValue =
            a[sortName] === PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
              ? 'Other'
              : a[sortName];
          const bValue =
            b[sortName] === PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
              ? 'Other'
              : b[sortName];
          if (sortBy === 'ASC') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        });
      }

      let modifiedData = [];

      for (const item of data) {
        let genericAttachment;
        try {
          if (item.is_voice_recording) {
            genericAttachment =
              await this.genericAttachmentFilesRepository.findOne({
                where: { attachment_id: item.id },
              });
          }

          const dataDetails = await getModifiedDataDetails(
            this.manageScriptsHistoryRepository,
            Number(item.id),
            this.userRepository
          );

          const modified_at = dataDetails['modified_at'];

          modifiedData.push({
            ...item,
            last_update: modified_at ?? item.created_at,
            file_attachment: genericAttachment,
          });
        } catch (error) {
          return resError(
            'Internel Server Error',
            ErrorConstants.Error,
            error.status
          );
        }
      }
      modifiedData = modifiedData.map((item) => {
        return {
          ...item,
          tenant_id: item.tenant_id ? item.tenant_id.id : null,
        };
      });

      let paginatedAndSortedData;
      if (sortName == 'last_update') {
        paginatedAndSortedData = await this.paginateAndSort(
          modifiedData,
          page,
          limit,
          sortBy
        );
      }

      const respData = paginatedAndSortedData
        ? paginatedAndSortedData
        : modifiedData;

      return resSuccess(
        'Call Scripts Fetched Successfully',
        'success',
        HttpStatus.OK,
        respData,
        count
      );
    } catch (e) {
      console.log(e);

      return resError('Internal Server Error', ErrorConstants.Error, e.status);
    }
  }

  async getSingleScript(id: any) {
    try {
      const call_script = await this.manageScriptsRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant_id: { id: this.request.user?.tenant?.id },
        },
        relations: ['created_by', 'tenant_id'],
      });
      if (!call_script) {
        return resError('Call Script not found', ErrorConstants.Error, 404);
      }

      let genericAttachment;
      if (call_script.is_voice_recording) {
        genericAttachment = await this.genericAttachmentFilesRepository.findOne(
          {
            where: { attachment_id: call_script.id },
          }
        );
      }

      const modifiedData = await getModifiedDataDetails(
        this.manageScriptsHistoryRepository,
        id,
        this.userRepository
      );
      const modified_by = modifiedData['modified_by'];
      const modified_at = modifiedData['modified_at'];

      let response;
      if (call_script) {
        response = {
          ...call_script,
          tenant_id: call_script.tenant_id ? call_script.tenant_id.id : null,
        };
      }

      return resSuccess(
        'Call Script Fetched Successfully',
        'success',
        HttpStatus.OK,
        {
          call_script: response,
          modified_by: modified_by,
          modified_at: modified_at,
          file_attachment: genericAttachment,
          tenant_id: this.request.user?.tenant?.id,
        }
      );
    } catch (error) {
      console.log({ error });
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async getCallJobCallScriptByCallJobId(id: any) {
    try {
      const call_job_call_script =
        await this.callJobsCallScriptsRepository.findOne({
          where: {
            call_job_id: { id },
            tenant_id: this.request.user?.tenant?.id,
          },
          relations: ['created_by'],
        });

      if (!call_job_call_script) {
        return resError(
          'Call Job Call Script not found',
          ErrorConstants.Error,
          404
        );
      }

      return await this.getSingleScript(call_job_call_script.call_script_id);
    } catch (error) {
      console.log({ error });
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async updateCallScript(file: Express.Multer.File, id: any, updatedData: any) {
    const call_script = await this.manageScriptsRepository.findOne({
      where: {
        id,
        is_archived: false,
        tenant_id: { id: this.request.user?.tenant?.id },
      },
    });

    if (!call_script) {
      return resError('Call Script not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCallScript = {
        name: updatedData?.name,
        script: updatedData?.script,
        is_active: updatedData?.is_active,
        script_type: updatedData?.script_type,
        is_voice_recording: updatedData?.is_voice_recording,
        is_recorded_message: updatedData.is_recorded_message,
      };

      if (updatedData.is_vm_changed == 'true') {
        if (file) {
          const passThrough = await this.convertToMp3(file);
          const attachmentPath = await this.s3Service.uploadScriptRecordingToS3(
            passThrough,
            id.toString()
          );

          const genericAttachmentExists =
            await this.genericAttachmentFilesRepository.findOne({
              where: {
                id,
              },
            });

          if (genericAttachmentExists) {
            await this.genericAttachmentFilesRepository.update(
              { attachment_id: id },
              {
                attachment_path: attachmentPath,
                attachment_name: file.originalname,
              }
            );
          } else {
            await this.genericAttachmentFilesRepository.delete({
              attachment_id: id,
            });

            const genericAttachment: any = new GenericAttachmentsFiles();
            genericAttachment.attachment_id = id;
            genericAttachment.attachment_path = attachmentPath;
            genericAttachment.created_at = new Date();
            genericAttachment.created_by = this.request.user.id;
            genericAttachment.attachment_name = file.originalname;
            genericAttachment.tenant_id = this.request.user?.tenant?.id;

            await this.genericAttachmentFilesRepository.save(genericAttachment);
          }
        }
      }

      await this.manageScriptsRepository.update({ id }, updatedCallScript);

      // Save the history of the changes
      await this.saveCallScriptHistory({
        ...call_script,
        history_reason: 'C',
        id: id,
      });

      await queryRunner.commitTransaction();

      return resSuccess(
        'Call Script Updated Successfully',
        'success',
        HttpStatus.OK,
        { ...updatedCallScript, tenant_id: this.request.user?.tenant?.id }
      );
    } catch (error) {
      console.log({ error });

      await queryRunner.rollbackTransaction();
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async archiveCallScript(id: any) {
    const call_script = await this.manageScriptsRepository.findOne({
      where: {
        id,
        is_archived: false,
        tenant_id: { id: this.request.user?.tenant?.id },
      },
    });

    if (!call_script) {
      return resError('Call Script not found', ErrorConstants.Error, 404);
    }

    let queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();

      const isActiveCallJobAssociated = await queryRunner.query(
        `SELECT 1 FROM call_jobs_call_scripts cjcs WHERE cjcs.call_script_id = $1`,
        [id]
      );

      if (isActiveCallJobAssociated.length > 0) {
        return resError(
          'Script in use. It cannot be archived.',
          ErrorConstants.Error,
          400
        );
      }

      queryRunner = this.entityManager.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCallScript = {
        is_archived: true,
      };

      await this.manageScriptsRepository.update({ id }, updatedCallScript);

      await this.saveCallScriptHistory({
        ...call_script,
        history_reason: 'D',
      });

      await queryRunner.commitTransaction();

      return resSuccess('Call Script Archived Successfully', 'success', 204, {
        ...updatedCallScript,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError('Internel Server Error', ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async saveCallScriptHistory(call_script: any) {
    try {
      const manageScriptHistory: any = new ManageScriptsHistory();
      manageScriptHistory.created_at = new Date();
      manageScriptHistory.created_by = this.request.user.id;
      manageScriptHistory.script = call_script?.script;
      manageScriptHistory.script_type = call_script?.script_type;
      manageScriptHistory.id = call_script?.id;
      manageScriptHistory.history_reason = call_script?.history_reason;
      manageScriptHistory.is_active = call_script?.is_active;
      manageScriptHistory.is_archived = call_script?.is_archived;
      manageScriptHistory.name = call_script?.name;
      manageScriptHistory.tenant_id = call_script?.tenant_id;
      manageScriptHistory.is_voice_recording = call_script?.is_voice_recording;
      await this.manageScriptsHistoryRepository.save(manageScriptHistory);
    } catch (error) {
      resError('Internel Server Error', ErrorConstants.Error, error.status);
    }
  }
}
