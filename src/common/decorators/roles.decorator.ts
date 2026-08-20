import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Role } from 'generated/prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiOperation({ summary: `[Yêu cầu: ${roles.join(', ')}]` })
  );
};
