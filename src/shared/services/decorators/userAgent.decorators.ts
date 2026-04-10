import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers['user-agent'];
  },
);
