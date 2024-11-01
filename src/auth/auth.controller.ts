import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDTO } from './dto/auth.dto';
import { SuccessResponse } from 'src/utilities/response.util';
import { Response } from 'express';
import { Public } from 'src/auth/auth.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Res() res: Response, @Body() createAuthDto: CreateUserDto) {
    return SuccessResponse(
      res,
      await this.authService.create({
        ...createAuthDto,
      }),
      'Account created',
    );
  }

  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: UserLoginDTO) {
    return SuccessResponse(
      res,
      await this.authService.login(loginDto),
      'Login Successful',
    );
  }
}
