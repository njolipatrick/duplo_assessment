import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import {
  GlobalExceptionFilter,
  ValidatorErrorHandler,
} from './middlewares/errorHandler';
import { WinstonModule } from 'nest-winston';
import instance from '../winston.config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });
  const configService = app.get(ConfigService);

  const whitelistString = configService.get<string>('WHITELIST');

  const whitelist =
    whitelistString && whitelistString !== '*'
      ? whitelistString.split(',')
      : '*';

  app.enableCors({ credentials: true, origin: whitelist });

  app.use([compression(), helmet()]);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe(ValidatorErrorHandler));

  app.useGlobalFilters(new GlobalExceptionFilter());

  const PORT = Number(configService.get<number>('PORT'));

  await app.listen(PORT);
}
bootstrap();
