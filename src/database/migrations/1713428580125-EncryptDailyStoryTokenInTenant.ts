import { MigrationInterface, QueryRunner } from 'typeorm';
import { AES, enc } from 'crypto-js';

export class EncryptDailyStoryTokenInTenant1713428580125
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tenants = await queryRunner.query(
      'SELECT id, dailystory_token FROM tenant'
    );
    for (const tenant of tenants) {
      const { id, dailystory_token } = tenant;
      if (dailystory_token) {
        const encryptedToken = await this.encryptSecretKey(dailystory_token);
        await queryRunner.query(
          `UPDATE tenant SET dailystory_token = $1 WHERE id = $2`,
          [encryptedToken, id]
        );
      }
    }
  }
  private async encryptSecretKey(secretKey: string) {
    const KEY = process.env.CRYPTO_SECRET_KEY;
    const IV = process.env.CRYPTO_IV_KEY;

    const encrypted = AES.encrypt(secretKey, KEY, { iv: IV });
    return encrypted.toString();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
