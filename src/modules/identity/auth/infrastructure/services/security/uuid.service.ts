import { randomUUID } from 'node:crypto';
import { IUuidService } from '../../../domain/services/uuid.service';

export class UuidAdapter implements IUuidService {
  generateId(): string {
    return randomUUID();
  }
}
