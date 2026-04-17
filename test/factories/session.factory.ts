import { SessionEntity } from '../../src/modules/auth/domain/entities/session.entity';
import { Session } from '../../src/modules/auth/domain/types/session';

export const buildSessionEntity = (overrides?: Partial<Session>): SessionEntity => {
  return SessionEntity.create({
    id: 'b8ae448b-6435-4a5b-888e-e945b808ca8a',
    userId: '68c07572-ff80-4326-8aff-3d109fbd5bcb',
    tokenHashed: '$2b$10$.dPEexCNqjgbMdE.etF6sO91fIcAH0oGQ3meuMeX0zkHEow/y3Blm',
    version: 1,
    userAgent: {
      browser: { name: 'Chrome' },
      os: { name: 'Android' },
      device: { type: 'mobile', vendor: 'nokia', model: 'Lumia 635' },
    },
    ipAddress: '192.168.1.1',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides,
  });
};

export const ACCESS_TOKEN = 'eyJhbGciOi456';
export const REFRESH_TOKEN = 'eyJhbGciOi123';
export const NEW_REFRESH_TOKEN = 'eyJhbGciOi789';
export const NEW_ACCESS_TOKEN = 'eyJhbGciOi789123';
export const REFRESH_TOKEN_HASHED =
  '$2b$10$ZJdfX65zETkNvX9AcwXsUesZGmY9BfgL7oHGY9Z2Sm/JgxYMVkOH2';
export const NEW_REFRESH_TOKEN_HASHED =
  '$2b$10$988FksUc0H/sdoNxCSJYXuHzJsYJXYMSv26s1fxSr8c7DsyDm3o36';
export const USER_AGENT = {
  browser: { name: 'Firefox' },
  os: { name: 'Linux' },
  device: { type: 'desktop', vendor: 'Dell', model: 'XPS 15' },
};
export const RAW_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
export const IP_ADDRESS = '192.168.1.2';
