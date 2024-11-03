import moment from 'moment-timezone';

export function differenceInMinutes(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const difference = endDate.getTime() - startDate.getTime();
  const differenceInMinutes = difference / (1000 * 60);

  return differenceInMinutes;
}

export const convertToTimeZone = (utcDate, timeZone) => {
  return moment.utc(utcDate).tz(timeZone);
};

export const TimeZoneCities = {
  GMT: 'America/Danmarkshavn',
  EAT: 'Africa/Nairobi',
  CET: 'Europe/Madrid',
  WAT: 'Africa/Bangui',
  CAT: 'Africa/Harare',
  EET: 'Asia/Gaza',
  '+01': 'Africa/Casablanca',
  SAST: 'Africa/Johannesburg',
  HST: 'America/Atka',
  AKST: 'US/Alaska',
  AST: 'America/Virgin',
  '-03': 'America/Punta_Arenas',
  EST: 'EST',
  CST: 'America/Chicago',
  '-04': 'America/Boa_Vista',
  '-05': 'America/Bogota',
  MST: 'US/Arizona',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  EDT: 'America/Montreal',
  CDT: 'America/Matamoros',
  MDT: 'America/Shiprock',
  HDT: 'US/Aleutian',
  AKDT: 'America/Sitka',
  '-02': 'America/Nuuk',
  '-01': 'America/Scoresbysund',
  NST: 'America/St_Johns',
  '+08': 'Asia/Singapore',
  '+07': 'Asia/Vientiane',
  '+10': 'Asia/Vladivostok',
  AEDT: 'Australia/Sydney',
  '+05': 'Asia/Samarkand',
  NZDT: 'Pacific/Auckland',
  '+03': 'Asia/Istanbul',
  '+00': 'Antarctica/Troll',
  '+06': 'Asia/Dhaka',
  '+12': 'Asia/Kamchatka',
  '+04': 'Asia/Dubai',
  IST: 'Asia/Jerusalem',
  '+09': 'Asia/Chita',
  '+0530': 'Asia/Colombo',
  HKT: 'Asia/Hong_Kong',
  WIB: 'Asia/Jakarta',
  WIT: 'Asia/Jayapura',
  '+0430': 'Asia/Kabul',
  PKT: 'Asia/Karachi',
  '+0545': 'Asia/Kathmandu',
  '+11': 'Asia/Srednekolymsk',
  WITA: 'Asia/Makassar',
  KST: 'Asia/Pyongyang',
  '+0630': 'Asia/Rangoon',
  '+0330': 'Asia/Tehran',
  JST: 'Asia/Tokyo',
  WET: 'Europe/Lisbon',
  ACDT: 'Australia/Adelaide',
  AEST: 'Australia/Brisbane',
  ACST: 'Australia/Darwin',
  '+0845': 'Australia/Eucla',
  AWST: 'Australia/Perth',
  '-10': 'Pacific/Rarotonga',
  '-11': 'Pacific/Niue',
  '-12': 'Etc/GMT+12',
  '-06': 'Pacific/Galapagos',
  '-07': 'Etc/GMT+7',
  '-08': 'Pacific/Pitcairn',
  '-09': 'Pacific/Gambier',
  '+13': 'Pacific/Tongatapu',
  '+14': 'Pacific/Kiritimati',
  '+02': 'Etc/GMT-2',
  UTC: 'Universal',
  MSK: 'Europe/Moscow',
  MET: 'MET',
  '+1345': 'Pacific/Chatham',
  ChST: 'Pacific/Saipan',
  '-0930': 'Pacific/Marquesas',
  SST: 'Pacific/Midway',
};
