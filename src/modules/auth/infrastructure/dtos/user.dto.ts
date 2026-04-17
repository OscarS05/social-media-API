import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a1496256-ab44-4448-b160-6515368d7585' })
  id!: string;

  @ApiProperty({ example: 'admin test' })
  name!: string;

  @ApiProperty({ example: 'member' })
  role!: string;

  @ApiProperty({ example: 'admin@test.com' })
  email!: string;
}
