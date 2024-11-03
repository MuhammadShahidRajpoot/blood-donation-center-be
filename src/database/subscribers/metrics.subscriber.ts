import {
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Counter, Histogram, register } from 'prom-client';
import { EntitySubscriberInterface } from 'typeorm/browser';
import { AfterQueryEvent } from 'typeorm/subscriber/event/QueryEvent.js';

interface EventGeneric {
  executionTime?: number;
  query?: string;
  entity?: object;
  databaseEntity?: object;
  metadata?: {
    tableName?: string;
  };
}

@EventSubscriber()
export class MetricSubscriber implements EntitySubscriberInterface {
  private databaseCounter: Counter;
  private databaseDurationHistogram: Histogram;
  private insertStartTime: number;
  private updateStartTime: number;
  private softRemoveTime: number;
  private removeTime: number;

  constructor() {
    this.initializeMetrics();
  }

  async initializeMetrics() {
    this.databaseCounter = new Counter({
      name: 'database_query_total',
      help: 'Total number of Database queries',
      labelNames: ['table', 'type'],
    });
    this.databaseDurationHistogram = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'duration in seconds',
      labelNames: ['table', 'type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    register.registerMetric(this.databaseCounter);
    register.registerMetric(this.databaseDurationHistogram);
  }

  afterQuery<T>(event: AfterQueryEvent<T>): void {
    const { tableName, type, executionTime } = this.getLabelData(
      event,
      'select'
    );
    this.incrementDatabaseQueryCounter(tableName, type);
    this.observeDatabaseQueryDuration(tableName, type, executionTime);
  }

  beforeInsert(): void {
    this.insertStartTime = Date.now();
  }
  afterInsert<T extends EventGeneric>(event: InsertEvent<T>): void {
    const { tableName, type, executionTime } = this.getLabelData(
      event,
      'insert',
      this.insertStartTime
    );
    this.incrementDatabaseQueryCounter(tableName, type);
    this.observeDatabaseQueryDuration(tableName, type, executionTime);
  }

  beforeUpdate(): void {
    this.updateStartTime = Date.now();
  }
  afterUpdate<T extends EventGeneric>(event: UpdateEvent<T>): void {
    const { tableName, type, executionTime } = this.getLabelData(
      event,
      'update',
      this.updateStartTime
    );
    this.incrementDatabaseQueryCounter(tableName, type);
    this.observeDatabaseQueryDuration(tableName, type, executionTime);
  }

  beforeSoftRemove(): void {
    this.softRemoveTime = Date.now();
  }
  afterSoftRemove<T extends EventGeneric>(event: SoftRemoveEvent<T>): void {
    const { tableName, type, executionTime } = this.getLabelData(
      event,
      'soft_remove',
      this.softRemoveTime
    );
    this.incrementDatabaseQueryCounter(tableName, type);
    this.observeDatabaseQueryDuration(tableName, type, executionTime);
  }

  beforeRemove(): void {
    this.removeTime = Date.now();
  }
  afterRemove<T extends EventGeneric>(event: RemoveEvent<T>): void {
    const { tableName, type, executionTime } = this.getLabelData(
      event,
      'remove',
      this.removeTime
    );
    this.incrementDatabaseQueryCounter(tableName, type);
    this.observeDatabaseQueryDuration(tableName, type, executionTime);
  }

  getLabelData<T extends EventGeneric>(
    event: T,
    type: string,
    startTime?: number
  ) {
    let executionTime: number;
    let tableName: string;
    if (type === 'select') {
      executionTime = event?.executionTime / 1000;
      const query = event?.query?.toLowerCase();
      const fromIndex = query?.lastIndexOf(' from ');
      if (fromIndex !== -1) {
        const tableNameSubstring = query?.substring(fromIndex + 6);
        const spaceIndex = tableNameSubstring?.indexOf(' ');
        if (spaceIndex !== -1) {
          tableName = tableNameSubstring?.substring(0, spaceIndex);
        } else {
          tableName = tableNameSubstring;
        }
      }
      tableName = tableName?.replace(/\"/g, '') || 'table';
    } else {
      executionTime = (Date.now() - startTime) / 1000;
      tableName = event?.metadata?.tableName;
    }
    return {
      executionTime: executionTime ?? 0,
      tableName: tableName ?? 'unknown',
      type: type ?? 'unknown',
    };
  }

  incrementDatabaseQueryCounter(table: string, type: string) {
    return this.databaseCounter.labels(table, type).inc();
  }

  observeDatabaseQueryDuration(table: string, type: string, time: number ) {
    time = time ?? 0
    this.databaseDurationHistogram.labels(table, type).observe(time);
  }
}
