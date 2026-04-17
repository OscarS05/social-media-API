import {
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../../../../../src/modules/auth/domain/errors/session.errors';
import { InvalidTokenError } from '../../../../../src/modules/auth/domain/errors/auth.errors';
import { SessionEntity } from '../../../../../src/modules/auth/domain/entities/session.entity';
import { UserAgentParsed } from '../../../../../src/modules/auth/domain/services/userAgent.service';

describe('SessionEntity entity', () => {
  const now = new Date();
  const expiration = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const id = 'b7a88a82-3f59-416f-b7b9-bcfc3cf81097';
  const userId = '68c07572-ff80-4326-8aff-3d109fbd5bcb';
  const tokenHashed = '$2b$10$.dPEexCNqjgbMdE.etF6sO91fIcAH0oGQ3meuMeX0zkHEow/y3Blm';
  const userAgentParsed: UserAgentParsed = {
    browser: { name: 'IEMobile' },
    os: { name: 'Windows' },
    device: { type: 'mobile', vendor: 'nokia', model: 'Lumia 635' },
  };
  const ipAddress = '127.0.0.1';
  const expiresAt = expiration;
  let sessionEntity: SessionEntity;

  const refreshTokenData = {
    id,
    userId,
    tokenHashed,
    version: 1,
    userAgent: userAgentParsed,
    ipAddress,
    revoked: false,
    expiresAt,
  };

  const refreshTokenRevoked = {
    ...refreshTokenData,
    revoked: true,
  };

  beforeEach(() => {
    sessionEntity = SessionEntity.create(refreshTokenData);
  });

  describe('create()', () => {
    it('should construct a new sessionEntity with valid data', () => {
      const sessionEntity = SessionEntity.create(refreshTokenData);

      expect(sessionEntity.id).toBe(id);
      expect(sessionEntity.userId).toBe(userId);
      expect(sessionEntity.tokenHashed).toBe(tokenHashed);
      expect(sessionEntity.version).toBe(1);
      expect(sessionEntity.userAgent).toBe(userAgentParsed);
      expect(sessionEntity.ipAddress).toBe(ipAddress);
      expect(sessionEntity.revoked).toBe(false);
      expect(sessionEntity.expiresAt).toStrictEqual(expiresAt);
    });
  });

  describe('fromPersistence()', () => {
    it('should rehydrate correctly an entity from the database', () => {
      const persisted = {
        ...refreshTokenData,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      const sessionEntity = SessionEntity.fromPersistence(persisted);

      expect(sessionEntity.id).toBe(id);
      expect(sessionEntity.userId).toBe(userId);
      expect(sessionEntity.tokenHashed).toBe(tokenHashed);
      expect(sessionEntity.userAgent).toBe(userAgentParsed);
      expect(sessionEntity.ipAddress).toBe(ipAddress);
      expect(sessionEntity.version).toBe(1);
      expect(sessionEntity.revoked).toBe(false);
      expect(sessionEntity.expiresAt).toStrictEqual(expiresAt);
      expect(sessionEntity.createdAt).toBe(now);
      expect(sessionEntity.updatedAt).toBe(now);
    });
  });

  describe('version', () => {
    it('should update version when a larger value is assigned', () => {
      sessionEntity.version = 2;

      expect(sessionEntity.version).toBe(2);
    });

    it('should throw InvalidTokenError when attempting to decrease version', () => {
      expect(() => {
        sessionEntity.version = 0;
      }).toThrow(InvalidTokenError);
    });
  });

  describe('isExpired()', () => {
    it('should not throw when the sessionEntity is not expired', () => {
      expect(() => sessionEntity.isExpired()).not.toThrow();
    });

    it('should throw RefreshTokenExpiredError when the sessionEntity is expired', () => {
      const oneDay = 24 * 60 * 60 * 1000;
      const expiredDate = new Date(now.getTime() - oneDay);

      sessionEntity['_expiresAt'] = {
        get: () => expiredDate,
      } as unknown as (typeof sessionEntity)['_expiresAt'];

      expect(() => sessionEntity.isExpired()).toThrow(RefreshTokenExpiredError);
    });
  });

  describe('isRevoked()', () => {
    it('should not throw when the sessionEntity is not revoked', () => {
      expect(() => sessionEntity.isRevoked()).not.toThrow();
    });

    it('should throw RefreshTokenRevokedError when the sessionEntity is revoked', () => {
      const sessionEntityRevoked = SessionEntity.fromPersistence({
        ...refreshTokenRevoked,
        createdAt: now,
        updatedAt: now,
      });

      expect(() => sessionEntityRevoked.isRevoked()).toThrow(RefreshTokenRevokedError);
    });
  });

  describe('isActive()', () => {
    it('should not throw when the sessionEntity is active', () => {
      expect(() => sessionEntity.isActive()).not.toThrow();
    });

    it('should throw RefreshTokenExpiredError when the sessionEntity is expired', () => {
      const expiredDate = new Date(now.getTime() - 10000);
      sessionEntity['_expiresAt'] = {
        get: () => expiredDate,
      } as unknown as (typeof sessionEntity)['_expiresAt'];

      expect(() => sessionEntity.isActive()).toThrow(RefreshTokenExpiredError);
    });

    it('should throw RefreshTokenRevokedError when the sessionEntity is revoked', () => {
      const sessionEntityRevoked = SessionEntity.fromPersistence({
        ...refreshTokenRevoked,
        createdAt: now,
        updatedAt: now,
      });

      expect(() => sessionEntityRevoked.isActive()).toThrow(RefreshTokenRevokedError);
    });
  });

  describe('revoke()', () => {
    it('should revoke the token and update updatedAt', () => {
      jest.useFakeTimers();
      const previousUpdatedAt = sessionEntity.updatedAt;

      jest.advanceTimersByTime(1);
      sessionEntity.revoke();

      expect(sessionEntity.revoked).toBeTruthy();
      expect(sessionEntity.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
      expect(sessionEntity.updatedAt).not.toBe(previousUpdatedAt);
    });

    it('should not change anything when the token is already revoked', () => {
      const sessionEntityRevoked = SessionEntity.fromPersistence({
        ...refreshTokenRevoked,
        createdAt: now,
        updatedAt: now,
      });
      const previousUpdatedAt = sessionEntityRevoked.updatedAt;

      expect(() => sessionEntityRevoked.revoke()).not.toThrow();
      expect(sessionEntityRevoked.revoked).toBeTruthy();
      expect(sessionEntityRevoked.updatedAt.getTime()).toBe(previousUpdatedAt.getTime());
    });
  });

  describe('rotateToken()', () => {
    const newTokenHashed = '$2b$10$0GWTPtVry5FkAUv1giWosOZrYx9cIFArerYJ.2eTM5Nax54AO78ZW';
    const newExpiration = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    it('should update tokenHashed, expiresAt and version when rotating successfully', () => {
      sessionEntity.rotateToken(newTokenHashed, newExpiration, 2);

      expect(sessionEntity.tokenHashed).toBe(newTokenHashed);
      expect(sessionEntity.expiresAt).toStrictEqual(newExpiration);
      expect(sessionEntity.version).toBe(2);
    });

    it('should reactivate token when rotating a revoked token', () => {
      const sessionEntityRevoked = SessionEntity.fromPersistence({
        ...refreshTokenRevoked,
        createdAt: now,
        updatedAt: now,
      });

      sessionEntityRevoked.rotateToken(newTokenHashed, newExpiration, 2);

      expect(sessionEntityRevoked.tokenHashed).toBe(newTokenHashed);
      expect(sessionEntityRevoked.expiresAt).toStrictEqual(newExpiration);
      expect(sessionEntityRevoked.revoked).toBeFalsy();
      expect(sessionEntityRevoked.version).toBe(2);
    });
  });
});
