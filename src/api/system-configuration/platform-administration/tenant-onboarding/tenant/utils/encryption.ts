import { AES, enc } from 'crypto-js';
import * as dotenv from 'dotenv';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
dotenv.config();
// Encryption function
export function encryptSecretKey(secretKey: string): string {
  const KEY = process.env.CRYPTO_SECRET_KEY;
  const IV = process.env.CRYPTO_IV_KEY;

  const encrypted = AES.encrypt(secretKey, KEY, { iv: IV });
  return encrypted.toString();
}

// Decryption function
export function decryptSecretKey(encryptedSecretKey: string): string {
  const KEY = process.env.CRYPTO_SECRET_KEY;
  const IV = process.env.CRYPTO_IV_KEY;

  const decrypted = AES.decrypt(encryptedSecretKey, KEY, { iv: IV });
  return decrypted.toString(enc.Utf8);
}
export const managerRolesAndPermissions = [
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_ARCHIVE,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_WRITE,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_READ,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_READ,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_READ,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE,
  PermissionsEnum.CALL_CENTER_MANAGE_DASHBOARD_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_DASHBOARD_WRITE,
  PermissionsEnum.CALL_CENTER_MANAGE_CALL_SCHEDULE_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_CALL_SCHEDULE_WRITE,
  PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_READ,
  PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ,
];
export const leadRolesAndPermissions = [
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_READ,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_READ,
  PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_DASHBOARD_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_DASHBOARD_WRITE,
  PermissionsEnum.CALL_CENTER_MANAGE_CALL_SCHEDULE_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_CALL_SCHEDULE_WRITE,
  PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_WRITE,
  PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_ARCHIVE,
  PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_READ,
  PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ,
];
export const agentRolesAndPermissions = [
  PermissionsEnum.CALL_CENTER_MANAGE_DASHBOARD_READ,
  PermissionsEnum.CALL_CENTER_MANAGE_DASHBOARD_WRITE,
  PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ,
];
