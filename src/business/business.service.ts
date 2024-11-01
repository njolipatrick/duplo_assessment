import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { PrismaPostgresService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { capitalizeWord } from 'src/utilities/util';
import { mailer } from 'src/utilities/mailer.util';
import { ROLE } from 'src/common/enum';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaPostgresService) {}
  async create(createBusinessDto: CreateBusinessDto) {
    const email = createBusinessDto.email;
    delete createBusinessDto.email;
    const data = {
      ...createBusinessDto,
    };
    const business = await this.prisma.business.create({ data });
    await this.inviteOwner({
      email,
      role: ROLE.BUSINESS_OWNER,
      business_id: business.id,
    });
    return business;
    //create an entry for business user to track all users in a business
    // await this.prisma.businessUser.create({
    //   data: {
    //     user_id: authUser.id,
    //     business_id: business.id,
    //   },
    // });
    //similar to department too
  }
  async inviteOwner(inviteOwner: Prisma.InviteUncheckedCreateInput) {
    const user = this.prisma.user.findUnique({
      where: { email: inviteOwner.email },
    });
    if (user) {
      throw new ConflictException(
        `User with email ${inviteOwner.email} already has an account`,
      );
    }
    const business = await this.findOne({
      id: inviteOwner.business_id,
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    const data = { ...inviteOwner, business_id: inviteOwner.business_id };
    const invite = await this.prisma.invite.create({
      data,
    });
    //send invite
    //construct html to parse to the mailer function
    mailer(
      `You have been invited to Join ${capitalizeWord(business.name)}`,
      '<h1></h1>',
      [invite.email],
    );
    return invite;
  }
  findAll() {
    return `This action returns all business`;
  }

  async findOne(query: Prisma.BusinessWhereUniqueInput) {
    return await this.prisma.business.findUnique({ where: query });
  }
  async findOneBusinessUser(query: Prisma.BusinessUserWhereInput) {
    return await this.prisma.businessUser.findFirst({ where: query });
  }
}
