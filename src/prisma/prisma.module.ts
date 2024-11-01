import { Module } from '@nestjs/common';
import { PrismaPostgresService } from './potgres.service';
import { PrismaMongoService } from './mongo.service';

@Module({
  providers: [PrismaPostgresService, PrismaMongoService],
  exports: [PrismaMongoService, PrismaPostgresService],
})
export class PrismaModule {}
