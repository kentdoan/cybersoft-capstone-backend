import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { excludePassword } from 'src/common/helpers/exclude-password.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const { email, password, name, phone, birthday, gender } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        gender,
        birthday,
      },
    });

    return excludePassword(newUser);
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const payload = { email: user.email, id: user.id, role: user.role };
    
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.prisma.auth.create({
      data: { 
        user_id: user.id, 
        refresh_token: hashedRefreshToken 
      },
    });

    return { access_token, refresh_token, user: excludePassword(user) };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token not found');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      
      const user = await this.prisma.users.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      const authTokens = await this.prisma.auth.findMany({
        where: { user_id: user.id },
      });

      let validAuth = null;
      for (const auth of authTokens) {
        const isMatch = await bcrypt.compare(refreshToken, auth.refresh_token);
        if (isMatch) {
          validAuth = auth;
          break;
        }
      }

      if (!validAuth) {
        throw new UnauthorizedException('Invalid Refresh Token or already logged out');
      }

      const newPayload = { email: user.email, id: user.id, role: user.role };
      const new_access_token = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const new_refresh_token = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      const hashedRefreshToken = await bcrypt.hash(new_refresh_token, 10);
      await this.prisma.auth.update({
        where: { id: validAuth.id },
        data: { refresh_token: hashedRefreshToken },
      });

      return { access_token: new_access_token, refresh_token: new_refresh_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Refresh Token');
    }
  }

  async logout(userId: number, refreshToken?: string) {
    if (!refreshToken) {
      // If no refreshToken, delete all
      await this.prisma.auth.deleteMany({
        where: { user_id: userId },
      });
    } else {
      // Find all tokens of this user
      const authTokens = await this.prisma.auth.findMany({
        where: { user_id: userId },
      });

      let validAuth = null;
      for (const auth of authTokens) {
        const isMatch = await bcrypt.compare(refreshToken, auth.refresh_token);
        if (isMatch) {
          validAuth = auth;
          break;
        }
      }

      // Delete the current device's token
      if (validAuth) {
        await this.prisma.auth.delete({
          where: { id: validAuth.id },
        });
      }
    }
    
  }
}
