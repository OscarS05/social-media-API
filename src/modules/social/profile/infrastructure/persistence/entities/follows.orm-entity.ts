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
import { Profiles } from './profile.orm-entity';

@Entity({ name: 'follows' })
@Index(['follower_id'])
@Index(['following_id'])
export class Follows extends BaseEntity {
  @ManyToOne(() => Profiles, (profile) => profile.following, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'follower_id' })
  follower!: Profiles;

  @ApiProperty({ description: 'The profile that follows another profile' })
  @PrimaryColumn({ name: 'follower_id', type: 'varchar', length: 36 })
  followerId!: string;

  @ManyToOne(() => Profiles, (profile) => profile.follower, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'following_id' })
  following!: Profiles;

  @ApiProperty({ description: 'The profile that was followed' })
  @PrimaryColumn({ name: 'following_id', type: 'varchar', length: 36 })
  followingId!: string;

  @ApiProperty({ description: 'The date the follow was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt!: Date;
}
