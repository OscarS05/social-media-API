import * as bcrypt from 'bcrypt';
import { HasherService } from '../../../domain/services/hasher.service';

export class BcryptPasswordHasher extends HasherService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
