import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          let data = request?.cookies?.accessToken;
          if (!data) {
             return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
          }
          return data;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload : (email, id, role)
    const user = await this.prisma.users.findUnique({
      where: { id: payload.id },
    });

    const activeToken = await this.prisma.auth.findFirst({
      where: { user_id: payload.id },
    });

    if (!user || !activeToken) {
      throw new UnauthorizedException('Token is not valid or user has logged out');
    }
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
