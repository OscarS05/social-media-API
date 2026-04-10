import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  @ApiProperty({ description: 'user name' })
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'user email' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 36)
  @ApiProperty({ description: 'user password' })
  password!: string;
}

export class LoginDto extends OmitType(RegisterDto, ['name']) {}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'access token' })
  accessToken!: string;
}
