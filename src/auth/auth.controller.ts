import { Controller, Post, Body, Get, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import express from 'express';
import { buildResponse } from '../common/helpers/response.helper';
import { storeCookies, clearCookies } from '../common/helpers/cookie.helper';
import { Cookies } from '../common/decorators/cookies.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginAuthDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(loginDto);
    storeCookies(res, access_token, refresh_token);

    return buildResponse('Đăng nhập thành công', { user, access_token });
  }

  @Post('refresh-token')
  async refreshToken(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.refreshToken(refreshToken);
    storeCookies(res, tokens.access_token, tokens.refresh_token);

    return buildResponse('Gia hạn token thành công', {
      access_token: tokens.access_token,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @CurrentUser('id') userId: number,
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    clearCookies(res);
    await this.authService.logout(userId, refreshToken);

    return buildResponse('Đăng xuất thành công');
  }
}
