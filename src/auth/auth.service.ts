import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const { email, password, name, phone, birthday, gender } = registerDto;

    const existingUser = await this.prisma.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const parsedBirthday = birthday ? new Date(birthday) : null;

    const newUser = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        gender,
        birthday: parsedBirthday,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      statusCode: 201,
      message: 'Đăng ký thành công',
      content: userWithoutPassword,
      dateTime: new Date().toISOString(),
    };
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
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

    const { password: dbPassword, ...userInfo } = user;
    return { access_token, refresh_token, user: userInfo };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy Refresh Token');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      
      const user = await this.prisma.users.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
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
        throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã đăng xuất');
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
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
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
    
    return {
      statusCode: 200,
      message: 'Đăng xuất thành công',
      dateTime: new Date().toISOString(),
    };
  }
}
