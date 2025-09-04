import { Roles } from '../../../../domain/entities/roles.enum';
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
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @ApiProperty({ description: 'The id of the user', example: '1319-4c9a-1319-' })
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @ApiProperty({ description: 'The user name' })
  @Column('varchar', { length: 255 })
  name: string;

  @ApiProperty({ description: 'The user role', example: Roles.MEMBER })
  @Column({ type: 'enum', enum: Roles, default: Roles.MEMBER })
  role: Roles;

  @ApiProperty({
    description: 'The date the user authentication method was deleted',
    example: null,
  })
  @Column('timestamp', { name: 'deleted_at', nullable: true, precision: 0 })
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

  // Relations
  //   @OneToMany(() => Profile, (p) => p.user)
  //   profiles: Profile[];

  @OneToMany(() => Auth, (auth) => auth.user)
  auth: Auth[];

  @OneToMany(() => RefreshToken, (RefreshToken) => RefreshToken.user)
  refreshTokens: RefreshToken[];
}
