export enum CallJobStatusEnum {
  NEW = 'new', // email and SMS CC Defined
  IN_PROGRESS = 'in_progress', // email and SMS CC Defined
  DELIVERED = 'delivered', // email and SMS
  BOUNCED = 'bounced', // email only
  BLOCKED = 'blocked', // email only
  DEFERRED = 'deferred', // email only
  FAILED = 'failed', // email and SMS
  SENT = 'sent', // SMS only
  UNDELIVERED = 'undelivered', // SMS only
  SCHEDULED = 'scheduled',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  IN_COMPLETE = 'in-complete',
  PENDING = 'pending',
  IN_ACTIVE = 'inactive',
}

export enum SegmentTypeEnum {
  NEW = 'new', // email and SMS CC Defined
  IN_PROGRESS = 'in_progress', // email and SMS CC Defined
  DELIVERED = 'delivered', // email and SMS
  BOUNCED = 'bounced', // email only
  BLOCKED = 'blocked', // email only
  DEFERRED = 'deferred', // email only
  FAILED = 'failed', // email and SMS
  SENT = 'sent', // SMS only
  UNDELIVERED = 'undelivered', // SMS only
}
