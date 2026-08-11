import { SetMetadata } from '@nestjs/common';

export const CLEAR_CACHE_KEYS = 'clear_cache_keys';
export const ClearCache = (...keys: string[]) => SetMetadata(CLEAR_CACHE_KEYS, keys);
