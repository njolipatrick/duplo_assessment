import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/postgres/client';
import { UserService } from 'src/user/user.service';
import { randomBytes } from 'crypto';
import { readPrivateKey } from 'src/middlewares/reader';
import { PrismaPostgresService } from 'src/prisma/potgres.service';
import { bcryptCompare } from 'src/utilities/bcrypt.util';
import { BusinessService } from 'src/business/business.service';
import { ROLE } from 'src/common/enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaPostgresService,
    private businessService: BusinessService,
  ) {}
  async sessions(data: Prisma.SessionUncheckedCreateInput) {
    return await this.prisma.session.create({ data });
  }
  async findSession(where: Prisma.SessionWhereUniqueInput) {
    return await this.prisma.session.findUnique({ where });
  }
  async updateSession(
    where: Prisma.SessionWhereUniqueInput,
    data: Prisma.SessionUpdateInput,
  ) {
    return await this.prisma.session.update({ where, data });
  }
  async delSession(where: Prisma.SessionWhereUniqueInput): Promise<any> {
    return await this.prisma.session.delete({ where });
  }
  async create(data: Partial<Prisma.UserCreateInput>) {
    const invite = await this.prisma.invite.findFirst({
      where: { email: data.email },
    });
    if (!invite) {
      throw new UnauthorizedException(
        'Registration denied. Please request a Duplo admin to send you an Invite',
      );
    }
    const checkUser = await this.userService.findOne({ email: data.email });
    if (checkUser) {
      throw new ConflictException(
        `User with email ${data.email} already exist`,
      );
    }
    const user = await this.userService.create({ ...data, role: invite.role });
    const authUser = user as User;
    delete authUser.password;
    //track if its a business owner
    if (invite.role === ROLE.BUSINESS_OWNER) {
      await this.prisma.businessUser.create({
        data: {
          user_id: authUser.id,
          business_id: invite.id,
        },
      });
    }
    //track if is a department member
    if (invite.role === ROLE.DEPARTMENT_HEAD) {
      await this.prisma.userDepartment.create({
        data: {
          user_id: authUser.id,
          business_id: invite.id,
          department_id: invite.department_id,
        },
      });
    }

    return this.generateLogin(authUser);
  }
  async login(data: Partial<Prisma.UserCreateInput>) {
    const user = await this.userService.findOne({ email: data.email });
    const authUser = user as User;

    if (!user) {
      throw new NotFoundException('User or password incorrect');
    }
    const dataU = await bcryptCompare(data.password, authUser.password);

    if (!dataU) {
      throw new NotFoundException('User or password incorrect');
    }

    delete authUser.password;
    return this.generateLogin(authUser);
  }
  async generateLogin(user: User): Promise<any> {
    const session_token = randomBytes(20).toString('hex');
    await this.sessions({ user_id: user.id, session_token });
    const hash = randomBytes(20).toString('hex');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, email, id, role, ...result } = user;
    const { business_id } = await this.businessService.findOneBusinessUser({
      user_id: id,
    });

    const payload = {
      id,
      email,
      hash,
      session_token,
      role,
      business_id,
    };
    return {
      id,
      email,
      role,
      ...result,
      business_id,
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('REFRESH_JWT_EXPIRES'),
        secret: this.configService.get<string>('REFRESH_TOKEN_KEY'),
        privateKey: await readPrivateKey('key'),
      }),
    };
  }
}
