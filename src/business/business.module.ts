import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService],
  imports: [PrismaModule],
  exports: [BusinessService],
})
export class BusinessModule {}
