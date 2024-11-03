import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContaminationAlerts } from '../common/entities/contamination-alerts.entity';
import { EntityManager } from 'typeorm';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  public tenantId: any;
  public endPointsToExclude = [
    '/contact-donors/blood-groups',
    '/filters/:code',
    '/filters/single/:code',
    '/auth/refresh-token',
  ];
  public objectsToExclude = [
    'coordinates',
    'prefix',
    'suffix',
    'prefix_id',
    'suffix_id',
    'blood_group_id',
    'race_id',
    'file_attachment',
  ];
  constructor(private readonly entityManager: EntityManager) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const timezone =
      request.user?.tenant?.tenant_time_zones?.length > 0
        ? request.user?.tenant?.tenant_time_zones[0]?.code
        : '';

    this.tenantId = request?.user?.tenant?.id;
    return next.handle().pipe(
      map((data) => {
        if (data.data) {
          if (
            typeof data === 'object' &&
            Object.values(data)?.length > 0 &&
            Array.isArray(data.data) &&
            data.data?.length > 0
          ) {
            data.data = data.data.map((item: any) => {
              if (item?.tenant && typeof item?.tenant === 'object') {
                const tenantId = item.tenant?.id;
                delete item.tenant;
                return {
                  ...item,
                  tenant_id: tenantId,
                };
              } else if (
                item?.tenant_id &&
                typeof item?.tenant_id === 'object'
              ) {
                const tenantId = item.tenant?.id;
                delete item.tenant_id;
                return {
                  ...item,
                  tenant_id: tenantId,
                };
              } else {
                return item;
              }
            });
          } else if (typeof data === 'object' && !Array.isArray(data.data)) {
            if (data.data?.tenant && typeof data.data?.tenant === 'object') {
              const tenantId = data.data.tenant?.id;
              delete data.data.tenant;
              data.data = {
                ...data.data,
                tenant_id: tenantId,
              };
            } else if (
              data.data?.tenant_id &&
              typeof data.data?.tenant_id === 'object'
            ) {
              const tenantId = data.data.tenant?.id;
              delete data.data.tenant;
              data.data = {
                ...data.data,
                tenant_id: tenantId,
              };
            }
          }
        }
        if (process.env.ENABLE_CONTAMINATION_ALERTS == 'true') {
          return this.transformJsonResponse(
            data,
            request?.url,
            request?.route?.path,
            request?.body,
            timezone,
            request
          );
        } else {
          return { ...data, timezone };
        }
      })
    );
  }
  transformJsonResponse(
    data: any,
    url: any,
    endpoint: any,
    body: any,
    timezone: any,
    request?: UserRequest
  ){
    if (this.endPointsToExclude.includes(endpoint)) {
      return { ...data, timezone };
    }
    const isSameTenatId = this.findKeys(data.data, request);
    if (!isSameTenatId) {
      const contaminationData = new ContaminationAlerts();
      contaminationData.url = url;
      contaminationData.endpoint = endpoint;
      contaminationData.response = data;
      contaminationData.request = body;
      this.saveContamincation(contaminationData);
      if (process.env?.DISBALE_CONTAMINATED_RESPONSE == 'true') {
        return {
          timezone,
          contaminationData, // need to reomve this added for testing
        };
      }
    }
    if (typeof data === 'string') return data;
    else return { ...data, timezone };
  }

  private findKeys(data: any, request: UserRequest) {
    if (
      (Array.isArray(data) && data?.length == 0) ||
      !data ||
      Object.values(data)?.length == 0
    ) {
      return true;
    }

    if (Array.isArray(data)) {
      for (const obj of data) {
        if (typeof obj === 'object' && Object.values(obj)?.length > 0) {
          if (!this.findKeysInObj(obj,request)) {
            return false;
          }
        }
      }
      return true;
    } else if (typeof data === 'object' && Object.values(data)?.length > 0) {
      return this.findKeysInObj(data,request);
    } else {
      return false;
    }
  }

  private findKeysInObj(obj: any,request:UserRequest) {
    const tenantId = this?.tenantId ?? request?.user?.tenant?.id ?? request?.user?.tenant_id
    const keysToCheck = ['tenant_id', 'tenant'];
    if (obj && typeof obj === 'object') {
      const hasRequiredKey = keysToCheck.some((key) => key in obj);
      if (!hasRequiredKey) {
        return false;
      }
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (keysToCheck.includes(key)) {
          const value = obj[key];
          if (
            value &&
            typeof value === 'object' &&
            Object.values(value)?.length > 0
          ) {
            return false;
          } else if (value != tenantId) {
            
            return false;
          }
        } else if (
          obj[key] &&
          typeof obj[key] === 'object' &&
          Object.values(obj[key])?.length > 0 &&
          !Array.isArray(obj[key])
        ) {
          if (!this.objectsToExclude.includes(key)) {
            if (!this.findKeysInObj(obj[key],request)) {
              return false;
            }
          }
        }
        // else if (
        //   obj[key] &&
        //   typeof obj[key] === 'object' &&
        //   Array.isArray(obj[key]) &&
        //   obj[key]?.length > 0
        // ) {
        //   for (const newObj of obj[key]) {
        //     if (
        //       newObj &&
        //       typeof newObj === 'object' &&
        //       !this.findKeysInObj(newObj, tenantId)
        //     ) {
        //       return false;
        //     }
        //   }
        // }
      }
    }
    return true;
  }

  private async saveContamincation(data) {
    await this.entityManager.save(data);
  }
}
