import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

import { Session as SessionORM } from '../../../modules/auth/infrastructure/persistence/db/entites/sessions.orm-entity';
import type { UserAgentParsed } from '../../../modules/auth/domain/services/userAgent.service';
import {
  IP_ADDRESS,
  REFRESH_TOKEN_HASHED,
  USER_AGENT,
} from '../../../../test/factories/session.factory';

const buildUserAgent = (): UserAgentParsed => ({
  browser: {
    name: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']),
    version: faker.system.semver(),
  },
  os: {
    name: faker.helpers.arrayElement(['Windows', 'macOS', 'Linux', 'Android', 'iOS']),
    version: faker.system.semver(),
  },
  device: {
    type: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
    vendor: faker.company.name(),
    model: faker.commerce.productName(),
  },
});

export const sessionFactoryData = (userId?: string, isTest?: boolean): SessionORM => {
  const session = new SessionORM();

  session.id = faker.string.uuid();
  session.userId = userId || 'null';
  session.tokenHashed = REFRESH_TOKEN_HASHED;
  session.version = 1;
  session.userAgent = isTest ? USER_AGENT : buildUserAgent();
  session.ipAddress = isTest ? IP_ADDRESS : faker.internet.ip();
  session.revoked = isTest ? false : faker.datatype.boolean();
  session.expiresAt = faker.date.soon({ days: 30 });
  session.createdAt = faker.date.past({ years: 1 });
  session.updatedAt = faker.date.recent({ days: 30 });

  return session;
};

export const sessionFactory = setSeederFactory(SessionORM, () => {
  return sessionFactoryData();
});
