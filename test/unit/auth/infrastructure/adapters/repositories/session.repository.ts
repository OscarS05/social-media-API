import { SessionRepository } from '../../../../../../src/modules/auth/domain/repositories/session.repository';

export class MockSessionRepository extends SessionRepository {
  create = jest.fn();
  findByIdAndUserId = jest.fn();
  update = jest.fn();
  updateByUserId = jest.fn();
  findAllByUserId = jest.fn();
}
