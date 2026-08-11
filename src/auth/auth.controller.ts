import { Controller, HttpCode, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import express from 'express';
import { storeCookies, clearCookies } from '../common/helpers/cookie.helper';
import { Cookies } from '../common/decorators/cookies.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('Register successfully')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @ResponseMessage('Login successfully')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginAuthDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(loginDto);
    storeCookies(res, access_token, refresh_token);
    return { user, access_token };
  }

  @Public()
  @ResponseMessage('Token refreshed successfully')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('refresh-token')
  async refreshToken(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.refreshToken(refreshToken);
    storeCookies(res, tokens.access_token, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @ApiBearerAuth()
  @ResponseMessage('Logout successfully')
  @Post('logout')
  async logout(
    @CurrentUser('id') userId: number,
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    clearCookies(res);
    await this.authService.logout(userId, refreshToken);
  }
}
