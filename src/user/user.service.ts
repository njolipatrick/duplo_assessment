import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/postgres/client';
import { PrismaPostgresService } from 'src/prisma/potgres.service';
import { bcryptHash } from 'src/utilities/bcrypt.util';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaPostgresService) {}
  logger: Logger;
  async create(data: Partial<Prisma.UserCreateInput>): Promise<User | boolean> {
    try {
      const user = await this.findOne({ email: data.email });

      if (user) {
        return false;
      }

      data.password = await bcryptHash(data.password);

      return await this.prisma.user.create({
        data,
      });
    } catch (error: any) {
      this.logger.error(error);
      throw new InternalServerErrorException('Something wrong happened');
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(query: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.findUnique({ where: query });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
