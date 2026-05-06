import { Body, Controller, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { Profiles as ProfileORM } from '../persistence/entities/profiles.orm-entity';
import { ProfileErrorMapper } from '../mappers/error.mapper';
import { CreateProfileDto, ProfileResponseDto, UpdateProfileDto } from '../dtos/profile.dto';
import { CreateProfileUseCase } from '../../application/use-cases/create-profile.usecase';
import { ImageValidationPipe } from '../../../../../shared/services/pipes/imageValidation.pipe';
import type { PayloadAccessToken } from '../../../../auth/domain/types/session';
import { CurrentUser } from '../../../../../shared/services/decorators/currentUser.decorator';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.usecase';

type ImageUploaded = {
  avatar?: Express.Multer.File[];
  coverPhoto?: Express.Multer.File[];
};

@ApiExtraModels(ProfileORM)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @ApiOperation({
    summary: 'Create the user profile',
    description: 'It creates the user profile managing the avatar and cover photo',
  })
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Information about the new profile',
    type: ProfileResponseDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ]),
  )
  @Post()
  async createProfile(
    @Body() body: CreateProfileDto,
    @CurrentUser() user: PayloadAccessToken,
    @UploadedFiles()
    files: ImageUploaded,
  ): Promise<ProfileResponseDto> {
    try {
      const avatar = new ImageValidationPipe().transform(files?.avatar?.[0]);
      const coverPhoto = new ImageValidationPipe().transform(files?.coverPhoto?.[0]);

      const response = await this.createProfileUseCase.execute(
        {
          username: body.username,
          typePrivacy: body.typePrivacy,
          bio: body.bio,
          userId: user.sub,
        },
        { buffer: avatar?.buffer as Buffer, filename: avatar?.originalname ?? '' },
        { buffer: coverPhoto?.buffer as Buffer, filename: coverPhoto?.originalname ?? '' },
      );

      return ProfileResponseDto.fromDomain(response);
    } catch (error) {
      throw ProfileErrorMapper(error as Error);
    }
  }

  @ApiOperation({
    summary: 'Update the user profile',
    description:
      'It updated the user profile managing the avatar and cover photo. This endpoint functinos as a Patch',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Information about the updated profile',
    type: ProfileResponseDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ]),
  )
  @Patch()
  async updateProfile(
    @Body() body: UpdateProfileDto,
    @CurrentUser() user: PayloadAccessToken,
    @UploadedFiles()
    files: ImageUploaded,
  ): Promise<ProfileResponseDto> {
    try {
      const avatar = new ImageValidationPipe().transform(files?.avatar?.[0]);
      const coverPhoto = new ImageValidationPipe().transform(files?.coverPhoto?.[0]);

      const response = await this.updateProfileUseCase.execute(
        user.sub,
        {
          username: body.username,
          typePrivacy: body.typePrivacy,
          bio: body.bio,
        },
        { buffer: avatar?.buffer as Buffer, filename: avatar?.originalname ?? '' },
        { buffer: coverPhoto?.buffer as Buffer, filename: coverPhoto?.originalname ?? '' },
      );

      return ProfileResponseDto.fromDomain(response);
    } catch (error) {
      throw ProfileErrorMapper(error as Error);
    }
  }
}
