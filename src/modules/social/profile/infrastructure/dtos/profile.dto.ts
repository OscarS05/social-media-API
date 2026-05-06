import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, Length, Matches, MaxLength } from 'class-validator';

import { Privacy } from '../../domain/enums/privacy.enum';
import { ProfileBasic } from '../../domain/types/profile';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProfileDto {
  @ApiProperty({
    example: 'john_doe',
    description:
      'Username between 3 and 20 characters. Only letters, numbers, dots and underscores are allowed.',
  })
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'Username can only contain letters, numbers, dots and underscores',
  })
  @Matches(/^(?![._])(?!.*[._]$).*$/, {
    message: 'Username cannot start or end with dot or underscore',
  })
  @Matches(/^(?!.*\.\.)(?!.*__).*$/, {
    message: 'Username cannot contain consecutive dots or underscores',
  })
  username!: string;

  @ApiPropertyOptional({
    example: 'Software developer and coffee lover',
    description: 'Profile biography. Maximum 280 characters.',
  })
  @IsString()
  @MaxLength(280)
  bio!: string | null;

  @ApiProperty({
    enum: Privacy,
    example: Privacy.PUBLIC,
    description: 'Profile privacy type',
  })
  @IsEnum(Privacy)
  typePrivacy!: Privacy;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}

export class ProfileResponseDto {
  @ApiProperty({
    example: 'a1496256-ab44-4448-b160-6515368d7585',
    description: 'The ID of the user that belongs to the profile',
  })
  @IsUUID(4)
  userId!: string;

  @ApiProperty({
    example: 'john_doe',
    description:
      'Username between 3 and 20 characters. Only letters, numbers, dots and underscores are allowed.',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    enum: Privacy,
    example: Privacy.PUBLIC,
    description: 'Profile privacy type',
  })
  @IsEnum(Privacy)
  typePrivacy!: string;

  @ApiPropertyOptional({
    example: 'Software developer and coffee lover',
    description: 'Profile biography. Maximum 280 characters.',
  })
  @IsString()
  bio!: string | null;

  @ApiPropertyOptional({
    example: '/url/avatar',
    description: 'User avatar',
  })
  @IsString()
  avatarUrl!: string | null;

  @ApiPropertyOptional({
    example: '/url/avatar',
    description: 'User background image',
  })
  @IsString()
  coverPhotoUrl!: string | null;
  // createdAt!: Date;
  // updatedAt!: Date;

  static fromDomain(data: ProfileBasic): ProfileResponseDto {
    return {
      userId: data.userId,
      username: data.username,
      bio: data.bio ?? null,
      typePrivacy: data.typePrivacy,
      avatarUrl: data.avatarUrl ?? null,
      coverPhotoUrl: data.coverPhotoUrl ?? null,
    };
  }
}
