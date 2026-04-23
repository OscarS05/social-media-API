import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';

export class MockProfileRepository extends ProfileRepository {
  findAllByUserId = jest.fn();
  findByUserId = jest.fn();
  findByUserName = jest.fn();
  findUsernames = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}
