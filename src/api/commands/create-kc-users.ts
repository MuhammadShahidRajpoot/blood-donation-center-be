import { Command, CommandRunner } from 'nest-commander';
import { keyCloakAdmin } from 'src/config/keycloak.config';
import { EntityManager, QueryRunner } from 'typeorm';
import { generateRandomString } from '../utils/generateRandomString';
import { sendDSEmail } from '../common/services/dailyStory.service';
import { decryptSecretKey } from '../system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';

@Command({ name: 'create-kc-users' })
export class CreateKCUsersCommand extends CommandRunner {
  private queryRunner: QueryRunner;

  constructor(private readonly entityManager: EntityManager) {
    super();
    this.queryRunner = this.entityManager.connection.createQueryRunner();
  }

  async updateUser(password, id, tenant_id, kc_username) {
    const query = `update public.user set password='${password}' where id=${id} and tenant_id=${tenant_id}`;
    const query_kc_username = `update public.user set keycloak_username='${kc_username}' where id=${id} and tenant_id=${tenant_id}`;

    await this.entityManager.query(query);
    await this.entityManager.query(query_kc_username);
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    try {
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction();
      const tenant_id: any = inputs?.[0];
      const dsTemplateId: any = inputs?.[1];

      if (!tenant_id) {
        console.log(
          `Run using "yarn command create-kc-users tenant_id template_id" Tenant Id is missing in Arg 1`
        );
        return;
      }

      if (!dsTemplateId) {
        console.log(
          `Run using "yarn command create-kc-users tenant_id template_id" DS Template Id is missing in Arg 2`
        );
        return;
      }

      console.log(
        `Running for tenant with ID ${tenant_id} and DS Template ID ${dsTemplateId}`
      );

      const kcAdmin = await keyCloakAdmin();
      const tenantQuery = `select * from public.tenant where id=${tenant_id}`;
      const tenantData = await this.entityManager.query(tenantQuery);

      if (!tenantData || !tenantData?.length) {
        console.log(`Tenant not found`);
        return;
      }
      const url = tenantData?.[0]?.admin_domain;

      console.log({ url });

      if (!url) {
        console.log(`Admin Domain not found`);
        return;
      }

      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      const subdomain = parts.length > 3 ? parts[1] : parts[0];
      const realms = await kcAdmin.realms.find();
      const realm = realms.find((realm: any) => realm.realm === subdomain);
      if (!realm) {
        console.log(`Realm not exists!!`);
        return;
      }

      const realmName = realm.realm;
      console.log(`Realm name is ${realmName}`);

      const token =  decryptSecretKey(tenantData?.[0]?.dailystory_token);
      if (!token) {
        console.log(`DS Config not found`);
        return;
      }
      console.log(`DS Token ${token}`);

      const userList = await this.entityManager.query(
        `select * from public.user where tenant_id=${tenant_id} and is_archived=false`
      );
      console.log(`Iterating ${userList.length} users`);

      for (const user of userList) {
        // const email = 'user@gmail.com'; // dev
        const email = user.email;
        const kcUser = await kcAdmin.users.findOne({
          realm: realmName,
          username: email,
        });
        console.log({ kcUser });

        if (!kcUser || !kcUser.length) {
          const password = generateRandomString(12);
          console.log(
            `Createing KC User with Email ${email} and Password => ${password}`
          );
          const createdUser = await kcAdmin.users.create({
            realm: realmName,
            username: email.toLowerCase(),
            email: email,
            enabled: true,
            attributes: user,
          });

          await kcAdmin.users.resetPassword({
            realm: realmName,
            id: createdUser.id,
            credential: {
              temporary: false,
              value: password,
            },
          });

          await this.updateUser(password, user.id, tenant_id,email);
          await sendDSEmail(
            dsTemplateId,
            email,
            {
              firstname: user.first_name,
              user_name: email,
              user_password: password,
            } as any,
            token
          );
          console.log({ createdUser });
        } else {
          console.log(`User with ID ${user.id} exists in KC, Skipping`);
        }
      }
      await this.queryRunner.commitTransaction();
    } catch (error) {
      console.error(`Exception occured: ${error}`);
      await this.queryRunner.rollbackTransaction();
    } finally {
      await this.queryRunner.release();
    }
  }
}
