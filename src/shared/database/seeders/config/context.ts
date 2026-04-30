import { DataSource } from 'typeorm';
import { SeederFactoryManager } from 'typeorm-extension';

export class SeederContext {
  constructor(
    public dataSource: DataSource,
    public factoryManager?: SeederFactoryManager,
  ) {}
}
