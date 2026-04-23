import { UsernameGeneratorService } from '../../../../../../src/modules/social/profile/application/services/username-generator.service';

describe('UsernameGeneratorService', () => {
  const service = new UsernameGeneratorService();
  const name = 'Oscar S';

  it('should generate base username when available', () => {
    const result = service.generate(name, []);
    expect(result).toBe('oscar_s');
  });

  it('should append _1 if base username is taken', () => {
    const result = service.generate(name, ['oscar_s']);
    expect(result).toBe('oscar_s_1');
  });

  it('should increment suffix correctly', () => {
    const result = service.generate(name, ['oscar_s', 'oscar_s_1', 'oscar_s_2']);
    expect(result).toBe('oscar_s_3');
  });

  it('should use max suffix + 1 even with gaps', () => {
    const result = service.generate('Oscar S', ['oscar_s', 'oscar_s_1', 'oscar_s_5']);
    expect(result).toBe('oscar_s_6');
  });

  it('should ignore usernames with non-numeric suffix', () => {
    const result = service.generate('Oscar S', ['oscar_s', 'oscar_s_test', 'oscar_s_2']);
    expect(result).toBe('oscar_s_3');
  });

  it('should return base if base is not included even if similar usernames exist', () => {
    const result = service.generate('Oscar S', ['oscar_s_1', 'oscar_s_2']);
    expect(result).toBe('oscar_s');
  });

  // Normalize
  it('should normalize name (lowercase and spaces)', () => {
    const result = service.generate('Oscar Santiago', []);
    expect(result).toBe('oscar_santiago');
  });

  it('should remove accents', () => {
    const result = service.generate('Óscar Monsalve', []);
    expect(result).toBe('oscar_monsalve');
  });

  it('should remove special characters', () => {
    const result = service.generate('Oscar!!! @@ S###', []);
    expect(result).toBe('oscar_s');
  });

  it('should replace multiple spaces with single underscore', () => {
    const result = service.generate('Oscar     Santiago', []);
    expect(result).toBe('oscar_santiago');
  });

  it('should fallback to "user" if name becomes empty', () => {
    const result = service.generate('!!!', []);
    expect(result).toBe('user');
  });

  it('should limit username length to 20 characters', () => {
    const result = service.generate('OscarSantiagoNombreMuyLargo', []);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('should handle complex real-world name', () => {
    const result = service.generate('  ÓSCAR!!!   SÁNCHEZ 123  ', ['oscar_sanchez_123']);
    expect(result).toBe('oscar_sanchez_123_1');
  });
});
