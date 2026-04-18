export type UserAgentParsed = {
  browser: { name: string; version?: string };
  os: { name: string; version?: string };
  device: { type?: string; vendor?: string; model?: string };
  cpu: { architecture: string };
};

export abstract class UserAgentService {
  abstract parse(userAgent: string): UserAgentParsed;
}
