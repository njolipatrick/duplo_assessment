import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { readPrivateKey } from 'src/middlewares/reader';
import { BusinessModule } from 'src/business/business.module';
import { DepartmentModule } from 'src/department/department.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        privateKey: await readPrivateKey('key'),
        expiresIn: configService.get<string>('JWT_EXPIRES'),
        algorithm: 'RS256',
        secret: configService.get<string>('JWT_SECRET'),
        global: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    PrismaModule,
    ConfigModule,
    BusinessModule,
    DepartmentModule,
  ],
})
export class AuthModule {}
