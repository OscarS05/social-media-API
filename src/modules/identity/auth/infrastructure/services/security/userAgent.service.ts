import * as uap from 'ua-parser-js';

import type {
  UserAgentParsed,
  UserAgentService,
} from '../../../domain/services/userAgent.service';

export class LibUserAgentService implements UserAgentService {
  parse(userAgent: string): UserAgentParsed {
    return uap.UAParser(userAgent) as UserAgentParsed;
  }
}
