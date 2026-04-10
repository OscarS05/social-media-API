import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request.cookies as Record<string, string>)?.['refreshToken'];
  },
);
