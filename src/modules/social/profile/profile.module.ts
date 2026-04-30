// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { Profiles as ProfilesORM } from './infrastructure/persistence/entities/profiles.orm-entity';
// import { Follows as FollowsORM } from './infrastructure/persistence/entities/follows.orm-entity';
// import { Blocks as BlocksORM } from './infrastructure/persistence/entities/blocks.orm-entity';
// import { CreateProfileUseCase } from './application/use-cases/create-profile.usecase';
// import { CreateProfileWithOAuthUseCase } from './application/use-cases/create-profile-after-oauth.usecase';
// import { UpdateProfileUseCase } from './application/use-cases/update-profile.usecase';
// import { GetProfileByUserIdUseCase } from './application/use-cases/get-profile-by-userId.usecase';
// import { GetProfilesByUsernameUseCase } from './application/use-cases/get-profiles-by-username.usecase';
// import { ProfileRepository } from './domain/repositories/profile.repository';
// import { ProfileRepositoryTypeORM } from './infrastructure/persistence/repositories/profiles.repository';
// import { UsernameGeneratorService } from './application/services/username-generator.service';
// import { ImageManagerService as ImageManagerServicePort } from './domain/services/image-manager.service';
// import { ImageManagerService } from '../../../shared/infrastructure/services/image-manager.service';

// @Module({
//   imports: [TypeOrmModule.forFeature([ProfilesORM, FollowsORM, BlocksORM])],
//   // controllers: [ProfileController],
//   providers: [
//     { provide: ProfileRepository, useClass: ProfileRepositoryTypeORM },
//     { provide: ImageManagerServicePort, useClass: ImageManagerService },
//     UsernameGeneratorService,
//     CreateProfileWithOAuthUseCase,
//     CreateProfileUseCase,
//     UpdateProfileUseCase,
//     GetProfileByUserIdUseCase,
//     GetProfilesByUsernameUseCase,
//   ],
// })
// export class ProfileModule {}
