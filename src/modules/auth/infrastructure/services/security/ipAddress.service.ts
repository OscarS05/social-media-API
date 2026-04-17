import * as ipaddr from 'ipaddr.js';

import { IpAddressService } from '../../../domain/services/ipAddress.service';

export class IpService extends IpAddressService {
  isValid(ip: string): boolean {
    return ipaddr.isValid(ip);
  }

  normalize(ip: string): string {
    const parsed = ipaddr.parse(ip);
    if (parsed.kind() === 'ipv6') {
      const ipv6 = parsed as ipaddr.IPv6;
      if (ipv6.isIPv4MappedAddress()) {
        return ipv6.toIPv4Address().toString();
      }
      return ipv6.toNormalizedString();
    }

    return parsed.toNormalizedString();
  }
}
