import { InjectRepository } from '@nestjs/typeorm';

import { Like, Repository } from 'typeorm';
import { transactionStorage } from '../../../../../../shared/services/transaction/transaction-context';
import { ProfileRepository } from '../../../domain/repositories/profile.repository';
import { Profiles as ProfileORM } from '../entities/profiles.orm-entity';
import { ProfileEntity } from '../../../domain/entities/profile.entity';
import { ProfileMapper } from '../../mappers/profile.mapper';
import {
  Profile,
  ProfileAccessContext,
  ProfilePreview,
  ProfileView,
  UpdateProfileData,
} from '../../../domain/types/profile';
import { ProfileViewMapper } from '../../mappers/profileView.mapper';
import { ProfileAccessContextMapper } from '../../mappers/profileAccessContext.mapper';
import { DomainNotFoundError } from '../../../domain/errors/profile.errors';

export type ProfileAccessContextRaw = {
  userId: string;
  isPrivate: boolean | number;
  isFollowing: boolean | number;
  isFollower: boolean | number;
  isBlocked: boolean | number;
};

export type ProfileDataRaw = Profile & {
  followers: string | number;
  following: string | number;
};

export class ProfileRepositoryTypeORM extends ProfileRepository {
  constructor(
    @InjectRepository(ProfileORM)
    private readonly ormRepo: Repository<ProfileORM>,
  ) {
    super();
  }

  async create(data: ProfileEntity): Promise<ProfileEntity> {
    const ormEntity: ProfileORM = ProfileMapper.toOrm(data);
    const newProfile = await this.repo.save(ormEntity);

    return ProfileMapper.toDomain(newProfile);
  }

  async update(userId: string, changes: UpdateProfileData): Promise<ProfileEntity> {
    await this.repo.update(userId, changes);

    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) throw new DomainNotFoundError();

    return ProfileMapper.toDomain(profile);
  }

  async delete(userId: string): Promise<void> {
    await this.repo.softDelete(userId);
  }

  async findAllProfilesByUsername(username: string): Promise<ProfilePreview[]> {
    const profiles = await this.repo.find({
      select: {
        userId: true,
        username: true,
        avatarUrl: true,
      },
      where: {
        username: Like(`%${username}%`),
      },
    });

    return profiles.map((p) => ({
      userId: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
    }));
  }

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const profile = await this.repo.findOne({ where: { userId } });
    return profile ? ProfileMapper.toDomain(profile) : null;
  }

  async findByUserName(username: string): Promise<ProfileEntity | null> {
    const profile = await this.repo.findOne({ where: { username } });
    return profile ? ProfileMapper.toDomain(profile) : null;
  }

  async findUsernames(username: string): Promise<string[]> {
    const profiles = await this.repo.find({
      select: { username: true },
      where: { username: Like(`%${username}%`) },
    });

    return profiles.map((p) => p.username);
  }

  async getProfileAccessContext(
    viewerId: string,
    ownerId: string,
  ): Promise<ProfileAccessContext> {
    const result = await this.repo
      .createQueryBuilder('p')
      .select([
        'p.user_id AS userId',
        `p.typePrivacy = 'private' AS "isPrivate"`,

        `EXISTS (
          SELECT 1 FROM follows f
          WHERE f.follower_id = :viewerId
            AND f.following_id = :ownerId
        ) AS "isFollowing"`,

        `EXISTS (
          SELECT 1 FROM follows f
          WHERE f.follower_id = :ownerId
            AND f.following_id = :viewerId
        ) AS "isFollower"`,

        `(
          EXISTS (
            SELECT 1 FROM blocks b
            WHERE b.blocker_id = :ownerId
              AND b.blocked_id = :viewerId
          )
          OR
          EXISTS (
            SELECT 1 FROM blocks b
            WHERE b.blocker_id = :viewerId
              AND b.blocked_id = :ownerId
          )
        ) AS "isBlocked"`,
      ])
      .where('p.user_id = :ownerId', { ownerId, viewerId })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne<ProfileAccessContextRaw>();

    return ProfileAccessContextMapper.fromRaw(result);
  }

  async getProfileBaseView(userId: string): Promise<ProfileView | null> {
    const result = await this.repo
      .createQueryBuilder('p')
      .select([
        'p.user_id AS "userId"',
        'p.username AS "username"',
        'p.avatar_url AS "avatarUrl"',
        'p.cover_photo_url AS "coverPhotoUrl"',
        'p.type_privacy AS "typePrivacy"',
        'p.bio AS "bio"',
        'p.created_at AS "createdAt"',
        'p.updated_at AS "updatedAt"',
        'p.deleted_at AS "deletedAt"',

        `(SELECT COUNT(*)
          FROM follows f
          WHERE f.following_id = p.user_id
        ) AS "followers"`,

        `(SELECT COUNT(*)
          FROM follows f
          WHERE f.follower_id = p.user_id
        ) AS "following"`,
      ])
      .where('p.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne<ProfileDataRaw>();

    return result ? ProfileViewMapper.fromRaw(result) : null;
  }

  private get repo(): Repository<ProfileORM> {
    const manager = transactionStorage.getStore();
    return manager ? manager.getRepository(ProfileORM) : this.ormRepo;
  }
}
