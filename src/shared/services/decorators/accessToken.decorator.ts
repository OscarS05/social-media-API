import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    return authHeader?.split(' ')[1];
  },
);
