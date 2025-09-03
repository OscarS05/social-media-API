import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource, Repository } from 'typeorm';

import { User } from '../../../modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { Roles } from '../../../modules/identity/users/domain/entities/roles.enum';
import { userFactoryData } from '../factories/user.factory';

type UserSeederResult = { adminUser: User; usersSaved: User[] };

export default class UserSeeder implements Seeder {
  constructor(
    private howMuchUsers: number = 10,
    private id: string = 'test-user-id',
    private name: string = 'admin-test',
    private role: Roles = Roles.ADMIN,
  ) {}

  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<UserSeederResult> {
    const userRepository = dataSource.getRepository(User);
    const userFactory = factoryManager.get(User);

    const adminUser = this.createAdmin(userRepository);
    await userRepository.save(adminUser);

    const usersSaved = await userFactory.saveMany(this.howMuchUsers);

    return { adminUser, usersSaved };
  }

  async runTestSeeders(dataSource: DataSource): Promise<UserSeederResult> {
    const userRepository = dataSource.getRepository(User);

    const adminUser = this.createAdmin(userRepository);
    await userRepository.save(adminUser);

    const usersSaved: User[] = [];
    for (let i = 0; i < this.howMuchUsers; i++) {
      usersSaved.push(userRepository.create(userFactoryData()));
    }
    await Promise.all(usersSaved.map((user) => userRepository.save(user)));

    return { adminUser, usersSaved };
  }

  private createAdmin(userRepository: Repository<User>) {
    return userRepository.create({
      id: this.id,
      name: this.name,
      role: this.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }
}
