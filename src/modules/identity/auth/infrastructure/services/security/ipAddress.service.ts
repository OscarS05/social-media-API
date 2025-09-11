import * as net from 'net';

import { IpAddressService } from '../../../domain/services/ipAddress.service';

export class NetIpService implements IpAddressService {
  isValid(ip: string): boolean {
    return net.isIP(ip) !== 0;
  }

  getVersion(ip: string): 4 | 6 | null {
    const version = net.isIP(ip);
    if (version === 4) return 4;
    if (version === 6) return 6;
    return null;
  }

  normalize(ip: string): string {
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }
}
