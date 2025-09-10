import {
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { RefreshTokenEntity } from '../../../../../../src/modules/identity/auth/domain/entities/refreshToken.entity';

describe('RefreshToken entity', () => {
  const date = new Date();
  const now = new Date();
  const expiration = date.setDate(now.getDate() + 30);
  const id: string = 'b8ae448b-6435-4a5b-888e-e945b808ca8a';
  const userId: string = '68c07572-ff80-8326-8aff-3d109fbd5bcb';
  const tokenHashed: string =
    '$2b$10$.dPEexCNqjgbMdE.etF6sO91fIcAH0oGQ3meuMeX0zkHEow/y3Blm';
  const userAgent: string = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36`;
  const ipAddress: string = '127.0.0.1';
  const expiresAt: Date = new Date(expiration);
  const createdAt: Date = now;
  const updatedAt: Date = now;
  let refreshTokenEntity: RefreshTokenEntity;

  beforeEach(() => {
    refreshTokenEntity = new RefreshTokenEntity(
      id,
      userId,
      tokenHashed,
      userAgent,
      ipAddress,
      false,
      expiresAt,
      createdAt,
      updatedAt,
    );
  });

  describe('isExpired()', () => {
    it('should return a false because the refreshToken is not expired', () => {
      expect(refreshTokenEntity.isExpired()).toBeFalsy();
    });

    it('should throw an error because the refreshToken is expired', () => {
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const expiresTomorrow = new Date(now.getTime() + oneDay);
      const refreshTokenEntityExpired = new RefreshTokenEntity(
        id,
        userId,
        tokenHashed,
        userAgent,
        ipAddress,
        true,
        new Date(expiresTomorrow),
        createdAt,
        updatedAt,
      );
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => expiresTomorrow.getTime() + oneDay + oneDay);

      expect(() => refreshTokenEntityExpired.isExpired()).toThrow(
        RefreshTokenExpiredError,
      );

      jest.spyOn(global.Date, 'now').mockRestore();
    });
  });

  describe('isRevoked()', () => {
    it('should return a false because the refreshToken is not revoked', () => {
      expect(refreshTokenEntity.isRevoked()).toBeFalsy();
    });

    it('should throw an error because the refreshToken is revoked', () => {
      const refreshTokenEntityExpired = new RefreshTokenEntity(
        id,
        userId,
        tokenHashed,
        userAgent,
        ipAddress,
        true,
        expiresAt,
        createdAt,
        updatedAt,
      );
      expect(() => refreshTokenEntityExpired.isRevoked()).toThrow(
        RefreshTokenRevokedError,
      );
    });
  });

  describe('isActive()', () => {
    it('should return a true because the refreshToken is active', () => {
      expect(refreshTokenEntity.isActive()).toBeTruthy();
    });

    it('should throw an error because the refreshToken is inactive', () => {
      const refreshTokenEntityExpired = new RefreshTokenEntity(
        id,
        userId,
        tokenHashed,
        userAgent,
        ipAddress,
        true,
        expiresAt,
        createdAt,
        updatedAt,
      );

      expect(() => refreshTokenEntityExpired.isActive()).toThrow(
        RefreshTokenRevokedError,
      );
    });
  });

  describe('revoke()', () => {
    it('should return a true because the token was revoked', () => {
      refreshTokenEntity.revoke();
      expect(refreshTokenEntity.getRevoked).toBeTruthy();
      expect(refreshTokenEntity.getUpdatedAt.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should not return anything because the token was already revoked', () => {
      const refreshTokenEntityExpired = new RefreshTokenEntity(
        id,
        userId,
        tokenHashed,
        userAgent,
        ipAddress,
        true,
        expiresAt,
        createdAt,
        updatedAt,
      );

      expect(() => refreshTokenEntityExpired.revoke()).not.toBe(true);
    });
  });
});
