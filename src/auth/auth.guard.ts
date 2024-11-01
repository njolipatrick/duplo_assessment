import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { readPublicKey } from '../middlewares/reader';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorator';
import { IAuth } from 'src/common/interface/interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<string>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException(
        'Invalid credentials. Please login with your details.',
      );
    }
    try {
      const cert = await readPublicKey('key');
      if (!cert) throw new UnauthorizedException('Token generation failure');

      const user = (await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        publicKey: cert,
      })) as IAuth;

      request['user'] = user;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Login session expired. Please login');
    }
    return true;
  }
  private extractTokenFromHeader(authorization: string): string | undefined {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
export const AuthenticatedUser = createParamDecorator(
  (hasRole: string[] = [], ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as IAuth;

    if (!user) throw new UnauthorizedException('Login to access this feature');

    if (hasRole.length && !hasRole.includes(user.role)) {
      throw new UnauthorizedException('You do not have access to the feature');
    }
    return user;
  },
);
