import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { Profiles } from './profiles.orm-entity';

@Entity({ name: 'blocks' })
@Index(['blockerId'])
@Index(['blockedId'])
export class Blocks extends BaseEntity {
  @ManyToOne(() => Profiles, (profile) => profile.blocksGiven, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'blocker_id' })
  blocker!: Profiles;

  @ApiProperty({ description: 'The profile that blocks another profile' })
  @PrimaryColumn({ name: 'blocker_id', type: 'varchar', length: 36 })
  blockerId!: string;

  @ManyToOne(() => Profiles, (profile) => profile.blocksReceived, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'blocked_id' })
  blocked!: Profiles;

  @ApiProperty({ description: 'The profile that was blocked' })
  @PrimaryColumn({ name: 'blocked_id', type: 'varchar', length: 36 })
  blockedId!: string;

  @ApiProperty({ description: 'The date the block was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt!: Date;
}
