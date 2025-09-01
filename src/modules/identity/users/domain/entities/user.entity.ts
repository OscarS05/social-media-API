export class UserEntity {
  constructor(
    public id: string,
    public name: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null,
  ) {}
}
