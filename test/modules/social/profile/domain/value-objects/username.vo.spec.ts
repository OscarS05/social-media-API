import { UsernameVO } from '../../../../../../src/modules/social/profile/domain/value-objects/username.vo';
import { InvalidUsernameError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('UsernameVO', () => {
  describe('create', () => {
    it('should create a valid username', () => {
      const username = UsernameVO.create('validuser');
      expect(username.get()).toBe('validuser');
    });

    it('should trim whitespace', () => {
      const username = UsernameVO.create('  user  ');
      expect(username.get()).toBe('user');
    });

    it('should allow alphanumeric, dot, and underscore', () => {
      const username = UsernameVO.create('user_123.name');
      expect(username.get()).toBe('user_123.name');
    });

    it('should throw error for username too short', () => {
      expect(() => UsernameVO.create('ab')).toThrow(InvalidUsernameError);
      expect(() => UsernameVO.create('ab')).toThrow('Invalid length');
    });

    it('should throw error for username too long', () => {
      const longUsername = 'a'.repeat(51);
      expect(() => UsernameVO.create(longUsername)).toThrow(InvalidUsernameError);
      expect(() => UsernameVO.create(longUsername)).toThrow('Invalid length');
    });

    it('should throw error for invalid characters', () => {
      expect(() => UsernameVO.create('user@name')).toThrow(InvalidUsernameError);
      expect(() => UsernameVO.create('user-name')).toThrow(InvalidUsernameError);
      expect(() => UsernameVO.create('user name')).toThrow(InvalidUsernameError);
    });

    it('should throw error for leading dot or underscore', () => {
      expect(() => UsernameVO.create('.username')).toThrow(InvalidUsernameError);
      expect(() => UsernameVO.create('_username')).toThrow(InvalidUsernameError);
    });

    it('should throw error for trailing dot or underscore', () => {
      expect(() => UsernameVO.create('username.')).toThrow(InvalidUsernameError);
      expect(() => UsernameVO.create('username_')).toThrow(InvalidUsernameError);
    });

    it('should throw error for consecutive dots', () => {
      expect(() => UsernameVO.create('user..name')).toThrow(InvalidUsernameError);
    });

    it('should throw error for consecutive underscores', () => {
      expect(() => UsernameVO.create('user__name')).toThrow(InvalidUsernameError);
    });

    it('should throw error for consecutive underscores', () => {
      expect(() => UsernameVO.create('user______name')).toThrow(InvalidUsernameError);
    });
  });

  describe('get', () => {
    it('should return the username value', () => {
      const username = UsernameVO.create('testuser');
      expect(username.get()).toBe('testuser');
    });
  });
});
