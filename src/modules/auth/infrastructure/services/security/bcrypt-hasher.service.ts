import * as bcrypt from 'bcrypt';
import { HasherService } from '../../../domain/services/hasher.service';

export class BcryptPasswordHasher extends HasherService {
  async hash(plain: string, rounds?: number): Promise<string> {
    const envRounds = Number(process.env.ROUNDS_HASH_PASSWORD);
    const saltOrRounds = rounds || envRounds || 10;

    return bcrypt.hash(plain, saltOrRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
