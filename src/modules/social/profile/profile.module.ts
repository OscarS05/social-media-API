import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profiles as ProfilesORM } from './infrastructure/persistence/entities/profiles.orm-entity';
import { Follows as FollowsORM } from './infrastructure/persistence/entities/follows.orm-entity';
import { Blocks as BlocksORM } from './infrastructure/persistence/entities/blocks.orm-entity';
import { CreateProfileUseCase } from './application/use-cases/create-profile.usecase';
import { CreateProfileWithOAuthUseCase } from './application/use-cases/create-profile-after-oauth.usecase';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.usecase';
import { GetProfilesPreviewUseCase } from './application/use-cases/getProfilesPreview.usecase';
import { ProfileRepository } from './domain/repositories/profile.repository';
import { ProfileRepositoryTypeORM } from './infrastructure/persistence/repositories/profiles.repository';
import { UsernameGeneratorService } from './application/services/username-generator.service';
import { ImageManagerService as ImageManagerServicePort } from './domain/services/image-manager.service';
import { ImageManagerService } from '../../../shared/infrastructure/services/image-manager.service';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { ImageStoragePort } from '../../../shared/domain/services/image.service';
import { ImageLocalService } from '../../../shared/infrastructure/services/image-local.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfilesORM, FollowsORM, BlocksORM])],
  controllers: [ProfileController],
  providers: [
    { provide: ProfileRepository, useClass: ProfileRepositoryTypeORM },
    { provide: ImageStoragePort, useClass: ImageLocalService },
    { provide: ImageManagerServicePort, useClass: ImageManagerService },
    UsernameGeneratorService,
    CreateProfileWithOAuthUseCase,
    CreateProfileUseCase,
    UpdateProfileUseCase,
    // GetProfileByUserIdUseCase,
    GetProfilesPreviewUseCase,
  ],
})
export class ProfileModule {}
