import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../../modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { faker } from '@faker-js/faker';
import { Roles } from '../../../modules/identity/users/domain/entities/roles.enum';

export default setSeederFactory(User, () => {
  const user = new User();
  user.id = faker.string.uuid();
  user.name = faker.person.fullName();
  user.role = Roles.MEMBER;
  user.createdAt = faker.date.past({ years: 1 });
  user.updatedAt = faker.date.recent({ days: 30 });
  user.deletedAt =
    Math.random() < 0.7
      ? null
      : faker.date.between({ from: user.createdAt, to: new Date() });

  return user;
});
