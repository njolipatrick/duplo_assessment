import { Module } from '@nestjs/common';
import { PrismaPostgresService } from './prisma.service';

@Module({
  providers: [PrismaPostgresService],
  exports: [PrismaPostgresService],
})
export class PrismaModule {}
