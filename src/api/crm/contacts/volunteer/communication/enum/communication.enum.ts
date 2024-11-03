export enum contact_type_enum {
  WORK_PHONE = 'work_phone', // Work Phone
  MOBILE_PHONE = 'mobile_phone', // Mobile Phone
  OTHER_PHONE = 'other_phone', // Other Phone
  WORK_EMAIL = 'work_email', // Work Email
  PERSONAL_EMAIL = 'personal_email', // Personal Email
  OTHER_EMAIL = 'other_email', // Other email
}

export enum communication_message_type_enum {
  Email = 'email',
  SMS = 'sms',
}

export enum communication_status_enum {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  BOUNCED = 'bounced',
  BLOCKED = 'blocked',
  DEFERRED = 'deferred',
  FAILED = 'failed',
  SENT = 'sent',
  UNDELIVERED = 'undelivered',
}
