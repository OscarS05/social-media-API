import { ProfileAccessContext } from '../../domain/types/profile';
import { ProfileAccessContextRaw } from '../persistence/repositories/profiles.repository';

export class ProfileAccessContextMapper {
  static fromRaw(raw: ProfileAccessContextRaw | undefined): ProfileAccessContext {
    return {
      exists: raw ? true : false,
      isPrivate: raw ? !!raw.isPrivate : false,
      isFollowing: raw ? !!raw.isFollowing : false,
      isFollower: raw ? !!raw.isFollower : false,
      isBlocked: raw ? !!raw.isBlocked : false,
    };
  }
}
