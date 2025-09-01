import type { UuidService } from '../services/uuid.service';

export class UserIdVO {
  constructor(private readonly uuidService: UuidService) {}

  generateId(): string {
    return this.uuidService.generate();
  }
}
