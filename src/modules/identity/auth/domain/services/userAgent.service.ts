export type UserAgentParsed = {
  browser: { name: string; version?: string };
  os: { name: string; version?: string };
  device: { type: string; vendor: string; model: string };
};

export interface UserAgentService {
  parse(userAgent: string): UserAgentParsed;
}
