import { randomUUID } from 'node:crypto';
import { UuidService } from '../../../domain/services/uuid.service';

export class UuidAdapter extends UuidService {
  generate(): string {
    return randomUUID();
  }
}
