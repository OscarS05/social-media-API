import { Roles } from '../../../../domain/enums/roles.enum';
import { Session } from './sessions.orm-entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '../../../../domain/enums/providers.enum';
import { Exclude } from 'class-transformer';
import { Profiles } from '../../../../../social/profile/infrastructure/persistence/entities/profile.orm-entity';

@Entity({ name: 'users' })
@Unique(['email', 'deletedAt'])
@Index(['provider', 'providerId'])
export class User extends BaseEntity {
  @ApiProperty({ description: 'The id of the user', example: '1319-4c9a-1319-' })
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @ApiProperty({ description: 'The user name' })
  @Column('varchar', { length: 255 })
  name!: string;

  @ApiProperty({ description: 'The user role', example: Roles.MEMBER })
  @Column({ type: 'enum', enum: Roles, default: Roles.MEMBER })
  role!: Roles;

  @ApiProperty({
    description: 'The email of the user',
    example: 'admin@test.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

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
  provider!: AuthProvider;

  @ApiProperty({
    description:
      'The id that identifies the user with the provider using authentication with Google',
    example: '6085c332-1319-4c9a',
  })
  @Column({
    type: 'varchar',
    name: 'provider_id',
    length: 255,
    nullable: true,
  })
  providerId?: string | null;

  @ApiProperty({ description: 'Token for reset the password', example: null })
  @Column({ type: 'varchar', name: 'reset_token', length: 255, nullable: true })
  resetToken?: string | null;

  @ApiProperty({
    description: 'User verified by email or by third-party provider by signing in with Google',
  })
  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @ApiProperty({
    description: 'The date the user was deleted',
    example: null,
  })
  @Column('timestamp', { name: 'deleted_at', nullable: true, precision: 0 })
  deletedAt?: Date | null;

  @ApiProperty({ description: 'The date the user was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt!: Date;

  @ApiProperty({ description: 'The date the user was updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  updatedAt!: Date;

  @OneToOne(() => Profiles, (p) => p.user)
  profile!: Profiles[];

  @OneToMany(() => Session, (Session) => Session.user)
  sessions!: Session[];
}
