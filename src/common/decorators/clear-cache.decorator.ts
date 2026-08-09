import { SetMetadata } from '@nestjs/common';

export const ClearCache = (...keys: string[]) => SetMetadata('clear_cache_keys', keys);
