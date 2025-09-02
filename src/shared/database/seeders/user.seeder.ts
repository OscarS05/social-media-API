import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { User } from '../../../modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { Roles } from '../../../modules/identity/users/domain/entities/roles.enum';
import { Auth } from '../../../modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthProvider } from '../../../modules/identity/auth/domain/entities/providers.enum';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const authRepository = dataSource.getRepository(Auth);
    const userFactory = factoryManager.get(User);
    const authFactory = factoryManager.get(Auth);

    const adminUser = userRepository.create({
      id: 'admin-uuid-1',
      name: 'test admin',
      role: Roles.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    await userRepository.save(adminUser);

    const authAdmin = authRepository.create({
      id: 'admin-uuid-2',
      userId: adminUser.id,
      email: 'admin@test.com',
      password: 'password',
      provider: AuthProvider.LOCAL,
      providerUserId: null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await authRepository.save(authAdmin);

    const usersSaved = await userFactory.saveMany(10);
    await Promise.all(
      usersSaved.map((user) =>
        authFactory.saveMany(1, { userId: user.id, email: `${user.name}@test.com` }),
      ),
    );
  }
}
