import { PathVO } from '../../../../../../src/modules/social/profile/domain/value-objects/path.vo';
import { InvalidPathError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('PathVO', () => {
  describe('create', () => {
    it('should create a valid path starting with /', () => {
      const path = PathVO.create('/profile/user-123');

      expect(path.get()).toBe('/profile/user-123');
    });

    it('should trim whitespace and create valid path', () => {
      const path = PathVO.create('  /profile/user-123  ');

      expect(path.get()).toBe('/profile/user-123');
    });

    it('should accept path with hyphens', () => {
      const path = PathVO.create('/my-profile/user-id');

      expect(path.get()).toBe('/my-profile/user-id');
    });

    it('should accept path with underscores', () => {
      const path = PathVO.create('/my_profile/user_id');

      expect(path.get()).toBe('/my_profile/user_id');
    });

    it('should accept path with numbers', () => {
      const path = PathVO.create('/profile/123/posts/456');

      expect(path.get()).toBe('/profile/123/posts/456');
    });

    it('should accept path with mixed case', () => {
      const path = PathVO.create('/Profile/UserId/Posts');

      expect(path.get()).toBe('/Profile/UserId/Posts');
    });

    it('should throw error if path is empty', () => {
      expect(() => PathVO.create('')).toThrow(InvalidPathError);
    });

    it('should throw error if path is only whitespace', () => {
      expect(() => PathVO.create('   ')).toThrow(InvalidPathError);
    });

    it('should throw error if path does not start with /', () => {
      expect(() => PathVO.create('profile/user-123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains traversal sequence ..', () => {
      expect(() => PathVO.create('/profile/../admin')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains single ..', () => {
      expect(() => PathVO.create('/profile/..')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains whitespace in the middle', () => {
      expect(() => PathVO.create('/profile user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains tab character', () => {
      expect(() => PathVO.create('/profile\tuser/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains newline', () => {
      expect(() => PathVO.create('/profile\nuser/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains < character', () => {
      expect(() => PathVO.create('/profile<user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains > character', () => {
      expect(() => PathVO.create('/profile>user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains : character', () => {
      expect(() => PathVO.create('/profile:user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains " character', () => {
      expect(() => PathVO.create('/profile"user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains \\ character', () => {
      expect(() => PathVO.create('/profile\\user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains | character', () => {
      expect(() => PathVO.create('/profile|user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains ? character', () => {
      expect(() => PathVO.create('/profile?user/123')).toThrow(InvalidPathError);
    });

    it('should throw error if path contains * character', () => {
      expect(() => PathVO.create('/profile*user/123')).toThrow(InvalidPathError);
    });
  });

  describe('get', () => {
    it('should return the path value', () => {
      const pathValue = '/profile/user-123';
      const path = PathVO.create(pathValue);

      expect(path.get()).toBe(pathValue);
    });

    it('should return path without leading/trailing spaces', () => {
      const path = PathVO.create('  /profile/user-123  ');

      expect(path.get()).toBe('/profile/user-123');
    });

    it('should not expose internal mutations', () => {
      const path1 = PathVO.create('/profile/user-1');
      const value1 = path1.get();

      const path2 = PathVO.create('/profile/user-2');
      const value2 = path2.get();

      expect(value1).toBe('/profile/user-1');
      expect(value2).toBe('/profile/user-2');
    });
  });
});
