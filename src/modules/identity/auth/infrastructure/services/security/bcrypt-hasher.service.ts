import * as bcrypt from 'bcrypt';
import { IHasherService } from '../../../domain/services/password-hasher.service';

export class BcryptPasswordHasher implements IHasherService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
