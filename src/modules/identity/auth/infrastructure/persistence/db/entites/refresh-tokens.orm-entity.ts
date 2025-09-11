import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../../../users/infrastructure/persistence/db/entities/user.orm-entity';
import type { UserAgentParsed } from '../../../../domain/services/userAgent.service';

@Entity({ name: 'refresh_tokens' })
@Index(['user'])
@Index(['tokenHashed'])
export class RefreshToken extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Exclude()
  @Column({ type: 'varchar', name: 'token_hashed', length: 255 })
  tokenHashed: string;

  @Column({ type: 'json', name: 'user_agent', nullable: false })
  userAgent: UserAgentParsed;

  @Column({ type: 'varchar', name: 'ip_address', length: 255, nullable: false })
  ipAddress: string;

  @Column({ name: 'revoked', type: 'boolean', default: false })
  revoked: boolean;

  @Column({ name: 'expires_at', type: 'timestamp', precision: 0 })
  expiresAt: Date;

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
