import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../../../auth/infrastructure/persistence/db/entites/user.orm-entity';
import { ApiProperty } from '@nestjs/swagger';
import { Privacy } from '../../../domain/enums/privacy.enum';
import { Follows } from './follows.orm-entity';
import { Blocks } from './blocks.orm-entity';

@Entity({ name: 'profiles' })
@Unique(['username', 'deleted_at'])
export class Profiles extends BaseEntity {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Follows, (f) => f.follower, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  following!: Follows[];

  @OneToMany(() => Follows, (f) => f.following, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  follower!: Follows[];

  @OneToMany(() => Blocks, (b) => b.blocked, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  blocksGiven!: Blocks[]; // Users I block

  @OneToMany(() => Blocks, (b) => b.blocker, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  blocksReceived!: Blocks[]; // Users who block me

  @ApiProperty({ description: 'The user ID. Its a uuid' })
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  @ApiProperty({ description: `The user's nick name` })
  @Column({ name: 'username', type: 'varchar', length: 50, nullable: false })
  username!: string;

  @ApiProperty({ description: 'Profile biography' })
  @Column({ name: 'bio', type: 'varchar', length: 255, nullable: true })
  bio!: string | null;

  @ApiProperty({ description: 'Profile privacy' })
  @Column({
    name: 'type_privacy',
    type: 'enum',
    enum: Privacy,
    default: Privacy.PUBLIC,
    nullable: false,
  })
  typePrivacy!: Privacy;

  @ApiProperty({ description: 'Profile picture' })
  @Column({ name: 'avatar_url', type: 'varchar', length: 2083, nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ description: 'Profile background photo' })
  @Column({ name: 'cover_photo_url', type: 'varchar', length: 2083, nullable: true })
  coverPhotoUrl!: string | null;

  @ApiProperty({ description: 'The date the user profile was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt!: Date;

  @ApiProperty({ description: 'The date the user profile was updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'The date the user profile was deleted',
    example: null,
  })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true, precision: 0 })
  deletedAt?: Date | null;
}
