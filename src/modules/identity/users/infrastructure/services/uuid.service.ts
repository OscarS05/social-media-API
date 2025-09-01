import { randomUUID } from 'node:crypto';
import { UuidService as IUuidService } from '../../domain/services/uuid.service';

export class NodeUuidService implements IUuidService {
  generate(): string {
    return randomUUID();
  }
}
