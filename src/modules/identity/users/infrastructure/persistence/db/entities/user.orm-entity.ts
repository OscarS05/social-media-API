import { Auth } from '../../../../../auth/infrastructure/persistence/db/entites/auth.orm-entity';
import { RefreshToken } from '../../../../../auth/infrastructure/persistence/db/entites/refresh-tokens.orm-entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('timestamp', { name: 'deleted_at', nullable: true, precision: 0 })
  deletedAt?: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  updatedAt: Date;

  // Relations
  //   @OneToMany(() => Profile, (p) => p.user)
  //   profiles: Profile[];

  @OneToMany(() => Auth, (auth) => auth.user)
  auth: Auth[];

  @OneToMany(() => RefreshToken, (RefreshToken) => RefreshToken.user)
  refreshTokens: RefreshToken[];
}
