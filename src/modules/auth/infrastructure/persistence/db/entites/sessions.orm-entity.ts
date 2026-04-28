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

import { User } from './user.orm-entity';
import type { UserAgentParsed } from '../../../../domain/services/userAgent.service';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'sessions' })
@Index(['user'])
@Index(['id', 'revoked'])
export class Session extends BaseEntity {
  @ApiProperty({ description: 'Session ID. Its a uuid' })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ description: 'The user to whom the sesssion belongs' })
  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @ApiProperty({ description: 'Refresh token hashed' })
  @Exclude()
  @Column({ type: 'varchar', name: 'token_hashed', length: 255 })
  tokenHashed!: string;

  @ApiProperty({ description: 'Session version' })
  @Exclude()
  @Column({ type: 'int', name: 'version' })
  version!: number;

  @ApiProperty({ description: 'Information of the device where the user logs in' })
  @Column({ type: 'json', name: 'user_agent', nullable: false })
  userAgent!: UserAgentParsed;

  @ApiProperty({ description: 'IP address of the device where the user logs in' })
  @Column({ type: 'varchar', name: 'ip_address', length: 255, nullable: false })
  ipAddress!: string;

  @ApiProperty({ description: 'Indicates whether the session was revoked or terminated' })
  @Column({ name: 'revoked', type: 'boolean', default: false })
  revoked!: boolean;

  @ApiProperty({ description: 'The date on which the token expires' })
  @Column({ name: 'expires_at', type: 'timestamp', precision: 0 })
  expiresAt!: Date;

  @ApiProperty({ description: 'The date the session was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt!: Date;

  @ApiProperty({ description: 'The date the session was updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  updatedAt!: Date;
}
