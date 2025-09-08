import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @ApiProperty({ description: 'user name' })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'a1496256-ab44-4448-b160-6515368d7585' })
  id: string;

  @ApiProperty({ example: 'admin test' })
  name: string;

  @ApiProperty({ example: 'member' })
  role: string;

  @ApiProperty({ example: 'admin@test.com' })
  email: string;

  @ApiProperty({ example: '2025-09-08T17:44:02.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-08T17:44:02.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: null })
  deletedAt: Date | null;
}

export class UserWrapperResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
