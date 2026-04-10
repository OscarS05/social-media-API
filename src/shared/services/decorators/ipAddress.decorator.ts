import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.ip || request.socket.remoteAddress;
  },
);
