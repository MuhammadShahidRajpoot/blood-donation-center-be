import * as dotenv from 'dotenv';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap()
  .then(async () => {
    console.info('Command is executed...!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Server failed to execute the command`, err);
    process.exit(1);
  });
