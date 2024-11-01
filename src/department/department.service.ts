import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Prisma } from '@prisma/client';
import { PrismaPostgresService } from 'src/prisma/prisma.service';
import { capitalizeWord } from 'src/utilities/util';
import { mailer } from 'src/utilities/mailer.util';
import { ROLE } from 'src/common/enum';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaPostgresService) {}
  async create(data: CreateDepartmentDto) {
    const email = data.email;
    delete data.email;
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    let department;
    if (user) {
      department = await this.prisma.department.create({
        data: { ...data, head_id: user.id },
      });
    } else {
      department = await this.prisma.department.create({
        data: { ...data },
      });
      await this.inviteDepartment({
        email,
        role: ROLE.DEPARTMENT_HEAD,
        business_id: data.business_id,
        department_id: department.id,
      });
    }
    return department;
  }

  findAll() {
    return `This action returns all department`;
  }
  async inviteDepartment(inviteDto: Prisma.InviteUncheckedCreateInput) {
    const user = this.prisma.user.findUnique({
      where: { email: inviteDto.email },
    });
    if (user) {
      throw new ConflictException(
        `User with email ${inviteDto.email} already has an account`,
      );
    }
    const department = await this.findOne({
      id: inviteDto.department_id,
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    const data: Prisma.InviteUncheckedCreateInput = {
      ...inviteDto,
      business_id: department.business_id,
    };
    const invite = await this.prisma.invite.create({
      data,
    });
    //send invite
    //construct html to parse to the mailer function
    mailer(
      `You have been invited to Join ${capitalizeWord(department.name)}`,
      '<h1></h1>',
      [invite.email],
    );
    return invite;
  }
  async findOne(query: Prisma.DepartmentWhereUniqueInput) {
    return await this.prisma.department.findUnique({ where: query });
  }
}
