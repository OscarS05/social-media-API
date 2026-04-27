import { Blocks } from '../../src/modules/social/profile/domain/types/blocks';

export const buildBlockEntity = (overrides?: Partial<Blocks>): Blocks => {
  return {
    blockedId: '11f84962-c467-40a9-b437-a1e2a11b8b22',
    blockerId: 'b61d0a3b-1e8a-4ed7-a107-c6474b9602ff',
    createdAt: new Date(),
    ...overrides,
  };
};
