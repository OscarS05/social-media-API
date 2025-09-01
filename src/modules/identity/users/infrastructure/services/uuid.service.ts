import { randomUUID } from 'node:crypto';
import { IUuidService } from '../../domain/services/uuid.service';

export class NodeUuidService implements IUuidService {
  generateId(): string {
    return randomUUID();
  }
}
