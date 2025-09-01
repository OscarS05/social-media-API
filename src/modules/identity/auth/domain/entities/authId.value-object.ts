import { IUuidService } from '../services/uuid.service';

export class AuthIdVO {
  constructor(private readonly uuidService: IUuidService) {}

  generateId(): string {
    return this.uuidService.generateId();
  }
}
