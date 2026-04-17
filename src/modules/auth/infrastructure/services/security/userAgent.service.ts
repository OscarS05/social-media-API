import * as uap from 'ua-parser-js';

import { UserAgentParsed, UserAgentService } from '../../../domain/services/userAgent.service';

export class LibUserAgentService extends UserAgentService {
  parse(userAgent: string): UserAgentParsed {
    return uap.UAParser(userAgent) as UserAgentParsed;
  }
}
