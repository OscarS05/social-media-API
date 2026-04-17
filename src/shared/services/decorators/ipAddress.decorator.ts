import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IpService } from '../../../modules/auth/infrastructure/services/security/ipAddress.service';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket.remoteAddress;
    if (!ip) throw new Error('IP address is missing');

    const ipService = new IpService();
    if (!ipService.isValid(ip)) {
      throw new BadRequestException('Invalid IP address');
    }
    return ipService.normalize(ip);
  },
);
