import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'user email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({ description: 'user password' })
  password: string;
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ description: 'user username' })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'user email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(36)
  @ApiProperty({ description: 'user password' })
  password: string;
}
