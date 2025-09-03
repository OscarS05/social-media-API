import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../../modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { Auth } from '../../../modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthProvider } from '../../../modules/identity/auth/domain/entities/providers.enum';
import { authFactoryData } from '../factories/auth.factory';

const rounds = parseInt(process.env.ROUNDS_HASH_PASSWORD ?? '10', 10);

export default class AuthSeeder implements Seeder {
  constructor(
    private adminUser: User,
    private usersSaved: User[] = [],
    private howMuchAuthxUser: number = 1,
    private id: string = 'test-auth-admin-id',
    private email: string = 'admin@test.com',
    private plainPassword: string = 'password',
  ) {}

  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<Auth> {
    const authRepository = dataSource.getRepository(Auth);
    const authFactory = factoryManager.get(Auth);

    const authAdmin = await this.createAdmin(authRepository);

    await Promise.all(
      this.usersSaved.map((user) => {
        const safeName = (user.name || 'user').replace(/\s+/g, '.').toLowerCase();
        return authFactory.saveMany(this.howMuchAuthxUser ?? 1, {
          userId: user.id,
          email: `${safeName}@test.com`,
          deletedAt: user.deletedAt,
        });
      }),
    );

    return authAdmin;
  }

  async runTestSeeders(dataSource: DataSource): Promise<Auth> {
    const authRepository = dataSource.getRepository(Auth);

    const authAdmin = await this.createAdmin(authRepository);

    const authCreated: Auth[] = [];
    for (let i = 0; i < this.howMuchAuthxUser; i++) {
      const userId = this.usersSaved[i]?.id;
      authCreated.push(authRepository.create(authFactoryData(userId)));
    }
    await Promise.all(authCreated.map((auth) => authRepository.save(auth)));

    return authAdmin;
  }

  private async createAdmin(authRepository: Repository<Auth>): Promise<Auth> {
    const authAdmin = authRepository.create({
      id: this.id,
      userId: this.adminUser.id,
      email: this.email,
      password: await bcrypt.hash(this.plainPassword, rounds),
      provider: AuthProvider.LOCAL,
      providerUserId: null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await authRepository.save(authAdmin);

    return authAdmin;
  }
}
