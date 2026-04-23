import { Injectable } from '@nestjs/common';

@Injectable()
export class UsernameGeneratorService {
  generate(name: string, existingUsernames: string[]): string {
    const base = this.normalizeName(name);

    if (!existingUsernames.includes(base)) return base;

    const suffixes = existingUsernames
      .map((u) => {
        const match = u.match(new RegExp(`^${base}_(\\d+)$`));
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);

    const next = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 1;

    return `${base}_${next}`;
  }

  normalizeName(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 20) || 'user'
    );
  }
}
