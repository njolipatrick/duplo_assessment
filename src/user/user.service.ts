import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/postgres/client';
import { ROLE } from 'src/common/enum';
import { PrismaPostgresService } from 'src/prisma/potgres.service';
import { bcryptHash } from 'src/utilities/bcrypt.util';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(private prisma: PrismaPostgresService) {}
  async onModuleInit() {
    await this.prisma.user.create({
      data: {
        password: await bcryptHash('password'),
        email: 'ogmaro@yopmail.com',
        full_name: 'Njoli Patrick',
        role: ROLE.DULPO_ADMIN,
      },
    });
  }
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
