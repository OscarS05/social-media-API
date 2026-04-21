import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionManager } from '../../../domain/services/transaction-manager.service';
import { transactionStorage } from '../../../../../shared/services/transaction/transaction-context';

@Injectable()
export class TypeOrmTransactionManager extends TransactionManager {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) => {
      return transactionStorage.run(manager, () => fn());
    });
  }
}
