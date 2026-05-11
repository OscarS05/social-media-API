import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfilePreview } from '../../domain/types/profile';
import { UsernameVO } from '../../domain/value-objects/username.vo';
import { PaginatedResponse } from '../../../../../shared/domain/types/pagination.type';

interface GetProfilesPreviewParams {
  username: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetProfilesPreviewUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  public async execute({
    username,
    page = 1,
    limit = 15,
  }: GetProfilesPreviewParams): Promise<PaginatedResponse<ProfilePreview>> {
    const normalizedLimit = Math.min(limit, 15);
    const offset = (page - 1) * normalizedLimit;

    const { data, total } = await this.profileRepo.findAllProfilesByUsername(
      UsernameVO.create(username ?? '').get(),
      {
        offset,
        limit: normalizedLimit,
      },
    );

    return {
      data,
      page,
      limit: normalizedLimit,
      total,
      hasNextPage: page * normalizedLimit < total,
    };
  }
}
