import { Exclude } from 'class-transformer';
import { User } from '../../../../../users/infrastructure/persistence/db/entities/user.orm-entity';
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

@Entity({ name: 'refresh_tokens' })
@Index(['user'])
@Index(['tokenHashed'])
export class RefreshToken extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Exclude()
  @Column({ type: 'varchar', name: 'token_hashed', length: 255 })
  tokenHashed: string;

  @Column({ type: 'varchar', name: 'user_agent', length: 255, nullable: true })
  userAgent?: string | null;

  @Column({ type: 'varchar', name: 'ip_address', length: 255, nullable: true })
  ipAddress?: string | null;

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
