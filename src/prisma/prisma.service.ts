import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  constructor(private configService: ConfigService) {
    const pool = new Pool({ connectionString: configService.get<string>('DATABASE_URL') });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[PRISMA] Connection has been established successfully.');
    } catch (error) {
      console.error('[PRISMA] Unable to connect to the database:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
