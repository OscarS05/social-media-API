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
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'auth' })
@Index(['providerUserId', 'provider'])
@Index(['email'])
@Unique('oauth_unique', ['provider', 'providerUserId', 'deletedAt'])
export class Auth extends BaseEntity {
  @ApiProperty({ description: 'The id of the auth', example: '1319-4c9a-6c068' })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ManyToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'The userId to whom the auth belongs',
    example: '8ef7-6e71d206c068',
  })
  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ApiProperty({
    description: 'The email of the user for auth',
    example: 'test@test.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @ApiProperty({
    description: 'The password of the user for auth',
    example: '$2b$10$0GWTPtVr....',
  })
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string | null;

  @ApiProperty({
    description: 'The auth strategy used by the user',
    example: AuthProvider.GOOGLE,
  })
  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @ApiProperty({
    description:
      'The id that identifies the user with the provider using authentication with Google or Facebook',
    example: '6085c332-1319-4c9a',
  })
  @Column({
    type: 'varchar',
    name: 'provider_user_id',
    length: 255,
    nullable: true,
  })
  providerUserId?: string | null;

  @ApiProperty({ description: 'Token for reset the password', example: null })
  @Column({ type: 'varchar', name: 'reset_token', length: 255, nullable: true })
  resetToken?: string | null;

  @ApiProperty({
    description:
      'User verified by email or by third-party provider by signing in with Google or Facebook',
  })
  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @ApiProperty({
    description: 'The date the user authentication method was removed',
    example: null,
  })
  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    precision: 0,
  })
  deletedAt?: Date | null;

  @ApiProperty({ description: 'The date the user authentication method was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt: Date;

  @ApiProperty({ description: 'The date the user authentication method was updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  updatedAt: Date;
}
