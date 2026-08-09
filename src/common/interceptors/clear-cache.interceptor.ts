import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { tap } from 'rxjs/operators';

@Injectable()
export class ClearCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(async () => {
        const cacheKeys = this.reflector.get<string[]>('clear_cache_keys', context.getHandler());
        const req = context.switchToHttp().getRequest();

        if (cacheKeys && cacheKeys.length > 0) {
          for (let key of cacheKeys) {
            // Scan all params started by ':' (:id, :job_id,...)
            const matches = key.match(/:([a-zA-Z0-9_]+)/g);
            if (matches) {
              for (const match of matches) {
                const paramName = match.substring(1); //Delete ':'
                // Find value in params (URL), body (JSON), or query (?abc=xyz)
                const value = req.params[paramName] || req.body[paramName] || req.query[paramName];
                if (value !== undefined) {
                  key = key.replace(match, String(value));
                }
              }
            }
            await this.cacheManager.del(key);
          }
        }
      }),
    );
  }
}
