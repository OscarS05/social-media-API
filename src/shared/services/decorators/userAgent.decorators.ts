import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { LibUserAgentService } from '../../../modules/auth/infrastructure/services/security/userAgent.service';
import { UserAgentParsed } from '../../../modules/auth/domain/services/userAgent.service';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAgentParsed => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const raw = request.headers['user-agent'];
    if (!raw) throw new BadRequestException('User-Agent header is missing');

    const parser = new LibUserAgentService();
    return parser.parse(raw);
  },
);
