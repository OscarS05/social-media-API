import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AuthProvider } from '../../../../domain/entities/providers.enum';
import { User } from '../../../../../users/infrastructure/persistence/db/entities/user.orm-entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'auth' })
@Index(['providerUserId', 'provider'])
@Index(['email'])
@Unique('oauth_unique', ['provider', 'providerUserId', 'deletedAt'])
export class Auth extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ManyToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string | null;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({
    type: 'varchar',
    name: 'provider_user_id',
    length: 255,
    nullable: true,
  })
  providerUserId?: string | null;

  @Column({ type: 'varchar', name: 'reset_token', length: 255, nullable: true })
  resetToken?: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    precision: 0,
  })
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
}
