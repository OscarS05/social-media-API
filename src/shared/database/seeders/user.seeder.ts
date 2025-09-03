import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { User } from '../../../modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { Roles } from '../../../modules/identity/users/domain/entities/roles.enum';

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

    const adminUser = userRepository.create({
      id: this.id,
      name: this.name,
      role: this.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    await userRepository.save(adminUser);

    const usersSaved = await userFactory.saveMany(this.howMuchUsers);

    return { adminUser, usersSaved };
  }
}
