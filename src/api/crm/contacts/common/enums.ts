export enum ContactTypeEnum {
  'WORK_PHONE' = 1, // Work Phone
  'MOBILE_PHONE' = 2, // Mobile Phone
  'OTHER_PHONE' = 3, // Other Phone
  'WORK_EMAIL' = 4, // Work Email
  'PERSONAL_EMAIL' = 5, // Personal Email
  'OTHER_EMAIL' = 6, // Other email
}

export enum CommunicationMessageTypeEnum {
  EMAIL = '1',
  SMS = '2',
}

export enum CommunicationStatusEnum {
  'NEW' = '1', // email and SMS CC Defined
  'IN_PROGRESS' = '2', // email and SMS CC Defined
  'DELIVERED' = '3', // email and SMS
  'BOUNCED' = '4', // email only
  'BLOCKED' = '5', // email only
  'DEFERRED' = '6', // email only
  'FAILED' = '7', // email and SMS
  'SENT' = '8', // SMS only
  'UNDELIVERED' = '9', // SMS only
}

export enum AppointmentStatusTypeEnum {
  Scheduled = '1', // default value at the time of the record creation
  Complete = '2',
  Incomplete = '3',
  Cancelled = '4',
}
