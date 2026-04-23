export abstract class TransactionManager {
  abstract runInTransaction<T>(fn: () => Promise<T>): Promise<T>;
}
