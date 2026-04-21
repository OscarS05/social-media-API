import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

export const transactionStorage = new AsyncLocalStorage<EntityManager>();
