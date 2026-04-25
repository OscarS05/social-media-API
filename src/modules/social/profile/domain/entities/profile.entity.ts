import { Privacy } from '../enums/privacy.enum';
import { CreateProfilData, Profile, ProfileBasic, UpdateProfileData } from '../types/profile';
import { BioVO } from '../value-objects/bio.vo';
import { PathVO } from '../value-objects/path.vo';
import { UrlVO } from '../value-objects/url.vo';
import { UsernameVO } from '../value-objects/username.vo';
import { uuidVO } from '../value-objects/uuidVO';

export class ProfileEntity {
  private constructor(
    private readonly _userId: uuidVO,
    private _username: UsernameVO,
    private _avatarUrl: PathVO | UrlVO | null,
    private _coverPhotoUrl: PathVO | UrlVO | null,
    private _typePrivacy: Privacy,
    private _bio: BioVO,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(data: CreateProfilData): ProfileEntity {
    return new ProfileEntity(
      new uuidVO(data.userId),
      UsernameVO.create(data.username),
      data.avatarUrl ? this.resolveUrl(data.avatarUrl) : null,
      data.coverPhotoUrl ? this.resolveUrl(data.coverPhotoUrl) : null,
      data.typePrivacy,
      BioVO.create(data.bio ?? ''),
      new Date(),
      new Date(),
      null,
    );
  }

  static fromPersistence(data: Profile): ProfileEntity {
    return new ProfileEntity(
      new uuidVO(data.userId),
      UsernameVO.create(data.username),
      data.avatarUrl ? this.resolveUrl(data.avatarUrl) : null,
      data.coverPhotoUrl ? this.resolveUrl(data.coverPhotoUrl) : null,
      data.typePrivacy,
      BioVO.create(data.bio ?? ''),
      data.createdAt,
      data.updatedAt,
      data.deletedAt ?? null,
    );
  }

  private static resolveUrl(value: string): PathVO | UrlVO {
    if (value.startsWith('/')) return PathVO.create(value);
    return UrlVO.create(value);
  }

  private resolveUrl(value: string): PathVO | UrlVO {
    if (value.startsWith('/')) return PathVO.create(value);
    return UrlVO.create(value);
  }

  toBasic(): ProfileBasic {
    return {
      userId: this.userId,
      username: this.username,
      avatarUrl: this.avatarUrl,
      coverPhotoUrl: this.coverPhotoUrl,
      typePrivacy: this.typePrivacy,
      bio: this.bio,
    };
  }

  updateProfile(data: UpdateProfileData): void {
    if (data.username !== undefined) this._username = UsernameVO.create(data.username);
    if (data.bio !== undefined) this._bio = BioVO.create(data.bio ?? '');
    if (data.typePrivacy !== undefined) this._typePrivacy = data.typePrivacy;
    if (data.avatarUrl !== undefined)
      this._avatarUrl = data.avatarUrl ? this.resolveUrl(data.avatarUrl) : null;
    if (data.coverPhotoUrl !== undefined)
      this._coverPhotoUrl = data.coverPhotoUrl ? this.resolveUrl(data.coverPhotoUrl) : null;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this._deletedAt) throw new Error('Profile already deleted');
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this._deletedAt) throw new Error('Profile is not deleted');
    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  isPublic(): boolean {
    return this._typePrivacy === Privacy.PUBLIC;
  }

  isPrivate(): boolean {
    return this._typePrivacy === Privacy.PRIVATE;
  }

  get userId(): string {
    return this._userId.get();
  }
  get username(): string {
    return this._username.get();
  }
  get avatarUrl(): string | null {
    return this._avatarUrl ? this._avatarUrl.get() : null;
  }
  get coverPhotoUrl(): string | null {
    return this._coverPhotoUrl ? this._coverPhotoUrl.get() : null;
  }
  get typePrivacy(): Privacy {
    return this._typePrivacy;
  }
  get bio(): string | null {
    return this._bio.get();
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
}
