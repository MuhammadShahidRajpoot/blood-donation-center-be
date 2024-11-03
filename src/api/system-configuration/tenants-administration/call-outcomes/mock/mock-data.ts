import { ColorCodeEnum } from '../enums/call-outcomes.enum';

export const mockDataForDefault = [
  {
    name: 'Schedule Appointment',
    code: 'APPT',
    color: ColorCodeEnum.blue,
    next_call_interval: 21,
    is_active: true,
    is_archived: false,
    is_default: true,
  },
  {
    name: 'Busy',
    code: 'BUSY',
    color: ColorCodeEnum.pink,
    next_call_interval: 0,
    is_active: true,
    is_archived: false,
    is_default: true,
  },
  {
    name: 'No Answer',
    code: 'NA',
    color: ColorCodeEnum.purple,
    next_call_interval: 0,
    is_active: true,
    is_archived: false,
    is_default: true,
  },
  {
    name: 'Left Message',
    code: 'LM',
    color: ColorCodeEnum.orange,
    next_call_interval: 14,
    is_active: true,
    is_archived: false,
    is_default: true,
  },
  {
    name: 'Declined',
    code: 'No',
    color: ColorCodeEnum.red,
    next_call_interval: 21,
    is_active: true,
    is_archived: false,
    is_default: true,
  },
];
