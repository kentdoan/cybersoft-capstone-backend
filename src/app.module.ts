import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentModule } from './comment/comment.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { CategoryModule } from './category/category.module';
import { RentJobModule } from './rent-job/rent-job.module';
import { SkillModule } from './skill/skill.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import type { Cache } from 'cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommentModule,
    UsersModule,
    AuthModule,
    JobModule,
    CategoryModule,
    RentJobModule,
    SkillModule,
    PrismaModule,
    SubcategoryModule,
    CloudinaryModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [new KeyvRedis(configService.get<string>('REDIS_URL'))],
        ttl: 60 * 60 * 24 * 1000,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    // Check connection to Redis 
    try {
      await this.cacheManager.get('healthcheck');
      console.log('[REDIS] Connected successfully');
    } catch (error) {
      console.log({ redis: error });
    }
  }
}
