export class IAuthRepositoryMock {
  findByEmail = jest.fn();
  createAuth = jest.fn();
}
