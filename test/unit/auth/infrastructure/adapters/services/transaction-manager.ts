import { TransactionManager } from '../../../../../../src/modules/auth/domain/services/transaction-manager.service';

export class MockTransactionManager extends TransactionManager {
  runInTransaction = jest.fn();
}
