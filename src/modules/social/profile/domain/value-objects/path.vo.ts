import { InvalidPathError } from '../errors/profile.errors';

export class PathVO {
  private constructor(private readonly value: string) {}

  static create(input: string): PathVO {
    const value = input.trim();

    if (!value) throw new InvalidPathError('Path cannot be empty');

    if (!value.startsWith('/')) throw new InvalidPathError('Path must be relative');

    if (value.includes('..')) {
      throw new InvalidPathError('Path cannot contain traversal sequences');
    }

    if (/\s/.test(value)) {
      throw new InvalidPathError('Path cannot contain whitespace');
    }

    if (/[<>:"\\|?*]/.test(value)) {
      throw new InvalidPathError('Path contains invalid characters');
    }

    return new PathVO(value);
  }

  get(): string {
    return this.value;
  }
}
